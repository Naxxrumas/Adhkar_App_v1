import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabaseTypes';

// Use environment variables for URL and key in production, but for now we set it directly 
// based on user setup context.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lzemyipgzzdqhgkpndud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZW15aXBnenpkcWhna3BuZHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTA0MzQsImV4cCI6MjA4NzI2NjQzNH0.HMw3-9Kmz9yq9DahMbO-ubK3_w6rNDwuujTM7t_rQCw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
