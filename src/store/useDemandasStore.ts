import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Demanda, NovaDemanda, DemandaStatus, DemandaPrioridade,
  DemandaFilters, DEFAULT_FILTERS, ViewMode,
  ChecklistItem, Comentario, HistoricoItem,
} from '@/types/demandas';
import { mockDemandas } from '@/data/mockDemandas';

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

function makeHistoricoItem(
  tipo: HistoricoItem['tipo'],
  descricao: string,
  extra?: Partial<HistoricoItem>,
): HistoricoItem {
  return { id: uid(), tipo, descricao, autor: 'Bruno', criadoEm: now(), ...extra };
}

// ─── State ──────────────────────────────────────────────────────────────────

interface DemandasState {
  // Data
  demandas: Demanda[];

  // UI
  viewMode: ViewMode;
  filters: DemandaFilters;
  selectedId: string | null;
  isDrawerOpen: boolean;
  isModalOpen: boolean;
  editingId: string | null;     // null = new, string = editing existing

  // ─── Selectors ─────────────────────────────────────────────────────────

  getById: (id: string) => Demanda | undefined;
  getFiltered: () => Demanda[];

  // ─── CRUD ──────────────────────────────────────────────────────────────

  add: (data: NovaDemanda) => string;
  update: (id: string, updates: Partial<Demanda>, campo?: string) => void;
  remove: (id: string) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  duplicate: (id: string) => string;
  complete: (id: string) => void;
  updateStatus: (id: string, status: DemandaStatus) => void;
  updatePrioridade: (id: string, prioridade: DemandaPrioridade) => void;

  // ─── Checklist ─────────────────────────────────────────────────────────

  addChecklistItem: (demandaId: string, texto: string) => void;
  toggleChecklistItem: (demandaId: string, itemId: string) => void;
  deleteChecklistItem: (demandaId: string, itemId: string) => void;
  updateChecklistItem: (demandaId: string, itemId: string, texto: string) => void;

  // ─── Comments ──────────────────────────────────────────────────────────

  addComment: (demandaId: string, texto: string) => void;
  deleteComment: (demandaId: string, commentId: string) => void;

  // ─── View & Filters ────────────────────────────────────────────────────

  setViewMode: (mode: ViewMode) => void;
  setFilter: (key: keyof DemandaFilters, value: unknown) => void;
  setFilters: (f: Partial<DemandaFilters>) => void;
  clearFilters: () => void;

  // ─── Drawer / Modal ────────────────────────────────────────────────────

  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openModal: (id?: string) => void;   // id = edit, undefined = new
  closeModal: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useDemandasStore = create<DemandasState>()(
  persist(
    (set, get) => ({
      demandas: mockDemandas,
      viewMode: 'lista',
      filters: { ...DEFAULT_FILTERS },
      selectedId: null,
      isDrawerOpen: false,
      isModalOpen: false,
      editingId: null,

      // ── Selectors ────────────────────────────────────────────────────────

      getById: (id) => get().demandas.find((d) => d.id === id),

      getFiltered: () => {
        const { demandas, filters } = get();
        const today = new Date().toDateString();

        return demandas.filter((d) => {
          if (!filters.mostrarArquivadas && d.arquivada) return false;
          if (filters.mostrarArquivadas && !d.arquivada) return false;

          if (filters.search) {
            const q = filters.search.toLowerCase();
            if (
              !d.titulo.toLowerCase().includes(q) &&
              !d.clienteNome.toLowerCase().includes(q) &&
              !d.descricao.toLowerCase().includes(q)
            ) return false;
          }
          if (filters.status !== 'todas' && d.status !== filters.status) return false;
          if (filters.prioridade !== 'todas' && d.prioridade !== filters.prioridade) return false;
          if (filters.tipo !== 'todos' && d.tipo !== filters.tipo) return false;
          if (filters.clienteId && d.clienteId !== filters.clienteId) return false;
          if (filters.responsavel && d.responsavel !== filters.responsavel) return false;

          if (filters.vencidas) {
            const prazo = new Date(d.prazo);
            if (prazo >= new Date() || d.status === 'concluida') return false;
          }
          if (filters.prazoHoje) {
            if (new Date(d.prazo).toDateString() !== today) return false;
          }

          return true;
        });
      },

      // ── CRUD ─────────────────────────────────────────────────────────────

      add: (data) => {
        const id = uid();
        const novaOrdem = Math.max(0, ...get().demandas.map((d) => d.ordem)) + 1;
        const checklistItems: ChecklistItem[] = (data.checklist ?? []).map((texto) => ({
          id: uid(), texto, concluido: false, criadoEm: now(),
        }));
        const demanda: Demanda = {
          ...data,
          id,
          criadaEm: now(),
          atualizadaEm: now(),
          arquivada: false,
          ordem: novaOrdem,
          checklist: checklistItems,
          subtarefas: [],
          comentarios: [],
          historico: [makeHistoricoItem('criacao', `Demanda criada por Bruno`)],
          tags: data.tags ?? [],
          links: data.links ?? [],
        };
        set((s) => ({ demandas: [demanda, ...s.demandas] }));
        return id;
      },

      update: (id, updates, campo) => {
        set((s) => ({
          demandas: s.demandas.map((d) => {
            if (d.id !== id) return d;
            const historico: HistoricoItem[] = campo
              ? [
                  ...d.historico,
                  makeHistoricoItem('edicao', `${campo} alterado`, {
                    campo,
                    valorAnterior: String((d as unknown as Record<string, unknown>)[campo] ?? ''),
                    valorNovo: String((updates as unknown as Record<string, unknown>)[campo] ?? ''),
                  }),
                ]
              : d.historico;
            return { ...d, ...updates, atualizadaEm: now(), historico };
          }),
        }));
      },

      remove: (id) => {
        set((s) => ({ demandas: s.demandas.filter((d) => d.id !== id) }));
      },

      archive: (id) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== id ? d : {
              ...d, arquivada: true, status: 'arquivada', atualizadaEm: now(),
              historico: [...d.historico, makeHistoricoItem('arquivo', 'Demanda arquivada')],
            }
          ),
        }));
      },

      restore: (id) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== id ? d : {
              ...d, arquivada: false, status: 'aberta', atualizadaEm: now(),
              historico: [...d.historico, makeHistoricoItem('arquivo', 'Demanda restaurada')],
            }
          ),
        }));
      },

      duplicate: (id) => {
        const original = get().getById(id);
        if (!original) return '';
        const newId = uid();
        const maxOrdem = Math.max(0, ...get().demandas.map((d) => d.ordem)) + 1;
        const copia: Demanda = {
          ...original,
          id: newId,
          titulo: `${original.titulo} (cópia)`,
          status: 'aberta',
          arquivada: false,
          criadaEm: now(),
          atualizadaEm: now(),
          ordem: maxOrdem,
          historico: [makeHistoricoItem('criacao', `Duplicada de "${original.titulo}"`)],
          comentarios: [],
        };
        set((s) => ({ demandas: [copia, ...s.demandas] }));
        return newId;
      },

      complete: (id) => {
        get().updateStatus(id, 'concluida');
      },

      updateStatus: (id, status) => {
        set((s) => ({
          demandas: s.demandas.map((d) => {
            if (d.id !== id) return d;
            return {
              ...d, status, atualizadaEm: now(),
              historico: [
                ...d.historico,
                makeHistoricoItem('status', `Status alterado para "${status}"`, {
                  campo: 'status',
                  valorAnterior: d.status,
                  valorNovo: status,
                }),
              ],
            };
          }),
        }));
      },

      updatePrioridade: (id, prioridade) => {
        set((s) => ({
          demandas: s.demandas.map((d) => {
            if (d.id !== id) return d;
            return {
              ...d, prioridade, atualizadaEm: now(),
              historico: [
                ...d.historico,
                makeHistoricoItem('edicao', `Prioridade alterada para "${prioridade}"`, {
                  campo: 'prioridade',
                  valorAnterior: d.prioridade,
                  valorNovo: prioridade,
                }),
              ],
            };
          }),
        }));
      },

      // ── Checklist ──────────────────────────────────────────────────────

      addChecklistItem: (demandaId, texto) => {
        const item: ChecklistItem = { id: uid(), texto, concluido: false, criadoEm: now() };
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              checklist: [...d.checklist, item],
              atualizadaEm: now(),
              historico: [...d.historico, makeHistoricoItem('checklist', `Item adicionado: "${texto}"`)],
            }
          ),
        }));
      },

      toggleChecklistItem: (demandaId, itemId) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              atualizadaEm: now(),
              checklist: d.checklist.map((c) =>
                c.id !== itemId ? c : { ...c, concluido: !c.concluido }
              ),
            }
          ),
        }));
      },

      deleteChecklistItem: (demandaId, itemId) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              checklist: d.checklist.filter((c) => c.id !== itemId),
              atualizadaEm: now(),
            }
          ),
        }));
      },

      updateChecklistItem: (demandaId, itemId, texto) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              checklist: d.checklist.map((c) => c.id !== itemId ? c : { ...c, texto }),
              atualizadaEm: now(),
            }
          ),
        }));
      },

      // ── Comments ───────────────────────────────────────────────────────

      addComment: (demandaId, texto) => {
        const comment: Comentario = {
          id: uid(),
          autor: 'Bruno',
          avatar: 'BR',
          texto,
          criadoEm: now(),
        };
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              comentarios: [...d.comentarios, comment],
              atualizadaEm: now(),
              historico: [...d.historico, makeHistoricoItem('comentario', 'Comentário adicionado')],
            }
          ),
        }));
      },

      deleteComment: (demandaId, commentId) => {
        set((s) => ({
          demandas: s.demandas.map((d) =>
            d.id !== demandaId ? d : {
              ...d,
              comentarios: d.comentarios.filter((c) => c.id !== commentId),
              atualizadaEm: now(),
            }
          ),
        }));
      },

      // ── View & Filters ─────────────────────────────────────────────────

      setViewMode: (mode) => set({ viewMode: mode }),

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      setFilters: (f) =>
        set((s) => ({ filters: { ...s.filters, ...f } })),

      clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

      // ── Drawer / Modal ─────────────────────────────────────────────────

      openDrawer: (id) => set({ selectedId: id, isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false, selectedId: null }),
      openModal: (id) => set({ editingId: id ?? null, isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false, editingId: null }),
    }),
    {
      name: 'ab-demandas-v1',
      // Persist everything except UI state
      partialize: (s) => ({ demandas: s.demandas, viewMode: s.viewMode }),
    }
  )
);
