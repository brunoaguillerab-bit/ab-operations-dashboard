-- Create tables for the AB Tracking Operational Dashboard

-- ENUMS
CREATE TYPE task_status AS ENUM ('a_fazer', 'em_andamento', 'aguardando_cliente', 'feito', 'urgente', 'pausado');
CREATE TYPE priority_level AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- CLIENTS TABLE
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    saldo_google NUMERIC DEFAULT 0,
    saldo_meta NUMERIC DEFAULT 0,
    mrr NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OPERATIONAL TASKS TABLE
CREATE TABLE operational_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    tipo_de_midia VARCHAR(100),
    demanda VARCHAR(255) NOT NULL,
    descricao TEXT,
    status task_status DEFAULT 'a_fazer',
    prioridade priority_level DEFAULT 'media',
    prazo DATE,
    responsavel VARCHAR(100),
    ultima_otimizacao DATE,
    ultimo_relatorio DATE,
    checklist JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OPERATIONAL LOGS TABLE (For History)
CREATE TABLE operational_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES operational_tasks(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    action_type VARCHAR(50), -- 'status_change', 'edit', 'create'
    description TEXT,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Assuming basic authenticated usage
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (open for now for prototyping, but should be restricted in prod)
CREATE POLICY "Allow all access" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all access" ON operational_tasks FOR ALL USING (true);
CREATE POLICY "Allow all access" ON operational_logs FOR ALL USING (true);

-- Triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_modtime
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON operational_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DEMANDAS CENTRAL TABLE
CREATE TABLE IF NOT EXISTS demandas_central (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('Workana', 'AB Tracking', 'Pontuais')),
    nome_cliente VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    midia VARCHAR(50) NOT NULL CHECK (midia IN ('Google Ads', 'Meta Ads', 'Google e Meta', 'LinkedIn Ads', 'TikTok Ads', 'Outros')),
    url_google_ads TEXT,
    url_meta_ads TEXT,
    url_dashboard TEXT,
    tarefa_demanda TEXT NOT NULL,
    andamento_observacao TEXT,
    status VARCHAR(40) NOT NULL CHECK (status IN ('A fazer', 'Em andamento', 'Aguardando cliente', 'Aguardando pagamento', 'Feito', 'Recorrente', 'Pausado', 'Cancelado')),
    prazo_entrega DATE,
    data_relatorio DATE,
    data_otimizacao DATE,
    ultima_mensagem DATE,
    valor_mensalidade NUMERIC,
    responsavel VARCHAR(120),
    prioridade VARCHAR(20) NOT NULL CHECK (prioridade IN ('Baixa', 'Media', 'Alta', 'Urgente')),
    tags TEXT[] DEFAULT '{}',
    arquivado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DASHBOARD USER PREFERENCES (filter persistence)
CREATE TABLE IF NOT EXISTS dashboard_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_key TEXT NOT NULL,
    view_key TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_key, view_key)
);

ALTER TABLE demandas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access demandas_central" ON demandas_central FOR ALL USING (true);
CREATE POLICY "Allow all access dashboard_user_preferences" ON dashboard_user_preferences FOR ALL USING (true);

CREATE TRIGGER update_demandas_central_modtime
    BEFORE UPDATE ON demandas_central
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_user_preferences_modtime
    BEFORE UPDATE ON dashboard_user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
