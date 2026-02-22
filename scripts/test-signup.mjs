import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    console.log("Attempting signup...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `test_browser_${Date.now()}@browser.com`,
        password: 'password123',
        options: {
            data: { full_name: 'Browser User' }
        }
    });

    if (authError) {
        console.error("Signup failed:", authError);
    } else {
        console.log("Signup success! User ID:", authData.user.id);
    }
}

testSignup();
