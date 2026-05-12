import { useState, useCallback } from 'react';

export interface DashboardFilters {
  search: string;
  media: string;
  status: string;
}

export function useDashboardFilters() {
  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    media: '',
    status: '',
  });

  const updateFilter = useCallback((key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      media: '',
      status: '',
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
