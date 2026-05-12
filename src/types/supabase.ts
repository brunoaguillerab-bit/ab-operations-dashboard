export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          company: string | null
          saldo_google: number | null
          saldo_meta: number | null
          mrr: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          saldo_google?: number | null
          saldo_meta?: number | null
          mrr?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          saldo_google?: number | null
          saldo_meta?: number | null
          mrr?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      demandas_central: {
        Row: {
          id: string
          categoria: string
          nome_cliente: string
          empresa: string
          midia: string
          url_google_ads: string | null
          url_meta_ads: string | null
          url_dashboard: string | null
          tarefa_demanda: string
          andamento_observacao: string | null
          status: string
          prazo_entrega: string | null
          data_relatorio: string | null
          data_otimizacao: string | null
          ultima_mensagem: string | null
          valor_mensalidade: number | null
          responsavel: string | null
          prioridade: string
          tags: string[] | null
          arquivado: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          categoria: string
          nome_cliente: string
          empresa: string
          midia: string
          url_google_ads?: string | null
          url_meta_ads?: string | null
          url_dashboard?: string | null
          tarefa_demanda: string
          andamento_observacao?: string | null
          status?: string
          prazo_entrega?: string | null
          data_relatorio?: string | null
          data_otimizacao?: string | null
          ultima_mensagem?: string | null
          valor_mensalidade?: number | null
          responsavel?: string | null
          prioridade?: string
          tags?: string[] | null
          arquivado?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          categoria?: string
          nome_cliente?: string
          empresa?: string
          midia?: string
          url_google_ads?: string | null
          url_meta_ads?: string | null
          url_dashboard?: string | null
          tarefa_demanda?: string
          andamento_observacao?: string | null
          status?: string
          prazo_entrega?: string | null
          data_relatorio?: string | null
          data_otimizacao?: string | null
          ultima_mensagem?: string | null
          valor_mensalidade?: number | null
          responsavel?: string | null
          prioridade?: string
          tags?: string[] | null
          arquivado?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      dashboard_user_preferences: {
        Row: {
          id: string
          user_key: string
          view_key: string
          payload: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_key: string
          view_key: string
          payload?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_key?: string
          view_key?: string
          payload?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      operational_logs: {
        Row: {
          id: string
          task_id: string | null
          user_name: string | null
          action_type: string | null
          description: string | null
          old_value: Json | null
          new_value: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id?: string | null
          user_name?: string | null
          action_type?: string | null
          description?: string | null
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string | null
          user_name?: string | null
          action_type?: string | null
          description?: string | null
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string | null
        }
      }
      operational_tasks: {
        Row: {
          id: string
          client_id: string | null
          tipo_de_midia: string | null
          demanda: string
          descricao: string | null
          status: Database['public']['Enums']['task_status'] | null
          prioridade: Database['public']['Enums']['priority_level'] | null
          prazo: string | null
          responsavel: string | null
          ultima_otimizacao: string | null
          ultimo_relatorio: string | null
          checklist: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          tipo_de_midia?: string | null
          demanda: string
          descricao?: string | null
          status?: Database['public']['Enums']['task_status'] | null
          prioridade?: Database['public']['Enums']['priority_level'] | null
          prazo?: string | null
          responsavel?: string | null
          ultima_otimizacao?: string | null
          ultimo_relatorio?: string | null
          checklist?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          tipo_de_midia?: string | null
          demanda?: string
          descricao?: string | null
          status?: Database['public']['Enums']['task_status'] | null
          prioridade?: Database['public']['Enums']['priority_level'] | null
          prazo?: string | null
          responsavel?: string | null
          ultima_otimizacao?: string | null
          ultimo_relatorio?: string | null
          checklist?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority_level: 'baixa' | 'media' | 'alta' | 'urgente'
      task_status:
        | 'a_fazer'
        | 'em_andamento'
        | 'aguardando_cliente'
        | 'feito'
        | 'urgente'
        | 'pausado'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


