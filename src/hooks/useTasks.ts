import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { OperationalTask, TaskFilters, TaskStatus } from '@/types';

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('operational_tasks')
        .select(`
          *,
          clients (
            id,
            name,
            company,
            saldo_google,
            saldo_meta,
            mrr
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Local search filter as Supabase basic text search requires specialized setup
      let filteredData = data as OperationalTask[];
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        filteredData = filteredData.filter(t => 
          t.demanda.toLowerCase().includes(s) || 
          t.clients?.name.toLowerCase().includes(s) ||
          t.clients?.company?.toLowerCase().includes(s)
        );
      }

      return filteredData;
    }
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: TaskStatus }) => {
      const { data, error } = await supabase
        .from('operational_tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return old.map((t: any) => t.id === id ? { ...t, status } : t);
      });

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<OperationalTask>) => {
      const { data, error } = await supabase
        .from('operational_tasks')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('operational_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
