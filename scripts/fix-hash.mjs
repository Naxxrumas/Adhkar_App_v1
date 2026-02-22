import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleId = process.env.SUPABASE_SERVICE_ROLE_KEY; // The user should have VITE_SUPABASE_ANON_KEY and maybe a service role key. 
// If we don't have service role key, we can update auth.users encrypted_password by stealing an argon2 hash from another working user!
