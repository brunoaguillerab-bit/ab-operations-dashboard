import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PLACEHOLDER_URL = 'https://your-project.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-key';

/** True only when real credentials are present */
export const supabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl      !== PLACEHOLDER_URL &&
  supabaseAnonKey  !== PLACEHOLDER_KEY;

export const supabase = createClient<Database>(
  supabaseConfigured ? supabaseUrl     : PLACEHOLDER_URL,
  supabaseConfigured ? supabaseAnonKey : PLACEHOLDER_KEY,
);
