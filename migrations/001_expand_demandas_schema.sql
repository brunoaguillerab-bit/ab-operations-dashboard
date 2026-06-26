-- =============================================================================
-- Migration 001: Expand demandas_central schema
-- Description: Adiciona colunas de tracking de tempo, histórico de alterações,
--              comentários, tags relacionais e subtarefas à tabela demandas_central.
-- Safe to run: apenas ADD COLUMN e CREATE TABLE — não modifica dados existentes.
-- Author: AB Tracking
-- Date: 2026-05-26
-- =============================================================================


-- =============================================================================
-- STEP 1: Expandir tabela demandas_central
-- =============================================================================

-- Soft delete: registra quando e por quem a demanda foi "excluída" logicamente.
-- Demandas com deleted_at preenchido devem ser filtradas nas queries padrão.
ALTER TABLE demandas_central
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by  TEXT        DEFAULT NULL;

-- Tracking de tempo: estimativa vs real para calcular acurácia de prazo.
-- Ambas em horas inteiras; tempo_gasto acumula via trigger ou aplicação.
ALTER TABLE demandas_central
  ADD COLUMN IF NOT EXISTS tempo_estimado_horas INTEGER      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_gasto_horas    INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_inicio          DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS data_conclusao       DATE         DEFAULT NULL;

-- saldo_conta_google_ads e saldo_conta_meta_ads: espelham os campos do frontend
-- (saldoContaGoogleAds / saldoContaMetaAds no tipo ClienteDemanda).
ALTER TABLE demandas_central
  ADD COLUMN IF NOT EXISTS saldo_conta_google_ads NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS saldo_conta_meta_ads   NUMERIC DEFAULT NULL;


-- =============================================================================
-- STEP 2: Tabela de histórico de alterações (audit trail)
-- Cada linha registra uma mudança de campo de uma demanda específica.
-- =============================================================================

CREATE TABLE IF NOT EXISTS demanda_historico (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FK para a demanda alterada. ON DELETE CASCADE: se a demanda for hard-deletada,
    -- o histórico vai junto. Para soft delete, manter a demanda com deleted_at preenchido.
    demanda_id     UUID        NOT NULL REFERENCES demandas_central(id) ON DELETE CASCADE,

    -- Identifica quem fez a mudança (email ou nome do usuário autenticado).
    usuario_id     TEXT        NOT NULL,

    -- Nome do campo alterado (ex: "status", "responsavel", "prazo_entrega").
    campo_alterado TEXT        NOT NULL,

    -- Valores em texto; usar JSONB caso o campo seja complexo (ex: tags[]).
    valor_anterior TEXT        DEFAULT NULL,
    valor_novo     TEXT        DEFAULT NULL,

    -- Timestamp automático da inserção.
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS e abrir acesso (restringir por usuário em produção se necessário).
ALTER TABLE demanda_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access demanda_historico"
  ON demanda_historico FOR ALL USING (true);


-- =============================================================================
-- STEP 3: Tabela de comentários por demanda
-- Suporta thread de discussão interna por tarefa, com soft delete próprio.
-- =============================================================================

CREATE TABLE IF NOT EXISTS demanda_comentarios (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    demanda_id  UUID        NOT NULL REFERENCES demandas_central(id) ON DELETE CASCADE,

    -- Autor do comentário.
    usuario_id  TEXT        NOT NULL,

    -- Conteúdo em texto livre; pode ser Markdown se o frontend suportar.
    conteudo    TEXT        NOT NULL,

    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Preenchido quando o autor edita o comentário.
    atualizado_em TIMESTAMPTZ DEFAULT NULL,

    -- Soft delete do comentário (NULL = ativo).
    deletado_em TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE demanda_comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access demanda_comentarios"
  ON demanda_comentarios FOR ALL USING (true);


-- =============================================================================
-- STEP 4: Tabela de tags relacionais
-- Alternativa ao array tags[] da demanda principal — permite indexar e filtrar
-- por tag com performance melhor que um ARRAY em texto.
-- =============================================================================

CREATE TABLE IF NOT EXISTS demanda_tags (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id  UUID        NOT NULL REFERENCES demandas_central(id) ON DELETE CASCADE,

    -- Texto da tag, normalizado em minúsculas pela aplicação.
    tag         TEXT        NOT NULL,

    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Garante que a mesma tag não seja adicionada duas vezes na mesma demanda.
    UNIQUE (demanda_id, tag)
);

ALTER TABLE demanda_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access demanda_tags"
  ON demanda_tags FOR ALL USING (true);


-- =============================================================================
-- STEP 5: Tabela de subtarefas (checklist estruturado)
-- Substitui / complementa o campo checklist JSONB da tabela operational_tasks.
-- =============================================================================

CREATE TABLE IF NOT EXISTS demanda_subtarefas (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id    UUID        NOT NULL REFERENCES demandas_central(id) ON DELETE CASCADE,

    -- Título curto da subtarefa.
    titulo        TEXT        NOT NULL,

    -- false = pendente, true = concluída.
    completa      BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Ordem de exibição na UI (menor = primeiro). Nullable: sem ordem = FIFO.
    ordem         INTEGER     DEFAULT NULL,

    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Preenchido quando completa = TRUE.
    completada_em TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE demanda_subtarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access demanda_subtarefas"
  ON demanda_subtarefas FOR ALL USING (true);


-- =============================================================================
-- STEP 6: Índices de performance
-- Criados com IF NOT EXISTS via DO block (compatível com Supabase/PostgreSQL 14+).
-- =============================================================================

-- demandas_central — filtros mais frequentes na UI
CREATE INDEX IF NOT EXISTS idx_demandas_status
  ON demandas_central (status);

CREATE INDEX IF NOT EXISTS idx_demandas_responsavel
  ON demandas_central (responsavel);

CREATE INDEX IF NOT EXISTS idx_demandas_prazo_entrega
  ON demandas_central (prazo_entrega);

-- Índice parcial: exclui demandas arquivadas e soft-deletadas dos scans de listagem
CREATE INDEX IF NOT EXISTS idx_demandas_ativas
  ON demandas_central (status, prazo_entrega)
  WHERE arquivado = FALSE AND deleted_at IS NULL;

-- demanda_historico — busca por demanda + ordem cronológica (mais comum)
CREATE INDEX IF NOT EXISTS idx_historico_demanda_timestamp
  ON demanda_historico (demanda_id, criado_em DESC);

-- demanda_comentarios — listagem dos comentários de uma demanda
CREATE INDEX IF NOT EXISTS idx_comentarios_demanda
  ON demanda_comentarios (demanda_id, criado_em ASC)
  WHERE deletado_em IS NULL;   -- exclui comentários deletados do índice

-- demanda_tags — lookup de todas as tags de uma demanda
CREATE INDEX IF NOT EXISTS idx_tags_demanda
  ON demanda_tags (demanda_id);

-- demanda_tags — busca global por tag (ex: filtrar todas as demandas com tag X)
CREATE INDEX IF NOT EXISTS idx_tags_tag
  ON demanda_tags (tag);

-- demanda_subtarefas — listagem das subtarefas de uma demanda
CREATE INDEX IF NOT EXISTS idx_subtarefas_demanda
  ON demanda_subtarefas (demanda_id, ordem NULLS LAST);


-- =============================================================================
-- STEP 7: Trigger para auto-completar completada_em em subtarefas
-- Quando completa muda de FALSE para TRUE, registra o timestamp automaticamente.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_subtarefa_completada_em()
RETURNS TRIGGER AS $$
BEGIN
    -- Só preenche completada_em na primeira vez que vira TRUE
    IF NEW.completa = TRUE AND OLD.completa = FALSE THEN
        NEW.completada_em = NOW();
    END IF;
    -- Limpa completada_em se a subtarefa for reaberta
    IF NEW.completa = FALSE AND OLD.completa = TRUE THEN
        NEW.completada_em = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subtarefa_completada_em ON demanda_subtarefas;
CREATE TRIGGER trg_subtarefa_completada_em
    BEFORE UPDATE ON demanda_subtarefas
    FOR EACH ROW
    EXECUTE FUNCTION set_subtarefa_completada_em();


-- =============================================================================
-- VERIFICAÇÃO (opcional — rodar manualmente para confirmar)
-- =============================================================================
-- SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--  WHERE table_name = 'demandas_central'
--  ORDER BY ordinal_position;
--
-- SELECT tablename FROM pg_tables
--  WHERE schemaname = 'public'
--    AND tablename LIKE 'demanda_%';
--
-- SELECT indexname FROM pg_indexes
--  WHERE schemaname = 'public'
--    AND tablename IN ('demandas_central','demanda_historico',
--                      'demanda_comentarios','demanda_tags','demanda_subtarefas');
-- =============================================================================
