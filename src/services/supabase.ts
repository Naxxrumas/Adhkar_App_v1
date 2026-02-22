import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabaseTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true; // Use fallback if env vars are missing

export const supabase = createClient<Database>(
  supabaseUrl || 'https://lzemyipgzzdqhgkpndud.supabase.co',
  supabaseAnonKey || 'sb_publishable_vhT85gUoGFX745gk0KuziQ_xU7MsMTp'
);
