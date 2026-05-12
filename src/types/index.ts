import { Database } from './supabase';

export type Client = Database['public']['Tables']['clients']['Row'];
export type OperationalTask = Database['public']['Tables']['operational_tasks']['Row'] & { clients?: Client };
export type OperationalLog = Database['public']['Tables']['operational_logs']['Row'];

export type TaskStatus = Database['public']['Enums']['task_status'];
export type PriorityLevel = Database['public']['Enums']['priority_level'];

export interface TaskFilters {
  status?: TaskStatus[];
  search?: string;
  clientId?: string;
  midia?: string;
}
