export type ViewMode = 'table' | 'kanban';

export interface DashboardState {
  searchValue: string;
  selectedMedia: string;
  selectedStatus: string;
  expandedGroups: Record<string, boolean>;
  editingClientId: string | null;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const MEDIA_OPTIONS: FilterOption[] = [
  { value: 'Google Ads', label: 'Google Ads' },
  { value: 'Meta Ads', label: 'Meta Ads' },
  { value: 'Google + Meta', label: 'Google + Meta' },
];

export const STATUS_OPTIONS: FilterOption[] = [
  { value: 'feito', label: '✓ Feito' },
  { value: 'a_fazer', label: '○ A Fazer' },
  { value: 'cliente', label: '⊗ Cliente' },
  { value: 'pausado', label: '∥ Pausado' },
  { value: 'urgente', label: '! Urgente' },
];
