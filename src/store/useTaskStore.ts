import { create } from 'zustand';
import { TaskFilters } from '@/types';

type ViewMode = 'table' | 'kanban' | 'calendar' | 'timeline';

interface TaskStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  isTaskModalOpen: boolean;
  setTaskModalOpen: (isOpen: boolean) => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  viewMode: 'table',
  setViewMode: (mode) => set({ viewMode: mode }),
  filters: {},
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  isTaskModalOpen: false,
  setTaskModalOpen: (isOpen) => set({ isTaskModalOpen: isOpen }),
  editingTaskId: null,
  setEditingTaskId: (id) => set({ editingTaskId: id }),
}));
