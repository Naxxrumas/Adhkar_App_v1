import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("Attempting login...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'm@m.com',
        password: 'password123'
    });

    if (authError) {
        console.error("Login failed:", authError);
    } else {
        console.log("Login success! User ID:", authData.user.id);
    }
}

testLogin();
