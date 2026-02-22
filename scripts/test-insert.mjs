import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE env vars in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertDeed() {
    // login 
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'm@m.com',
        password: '123321'
    });
    if (authError) {
        console.error("Login failed:", authError);
        return;
    }
    const userId = authData.user.id;
    console.log("Logged in as", userId);

    const deedData = {
        user_id: userId,
        group_id: 'personal',
        worship_type: 'body',
        name: 'test deed',
        description: 'test',
        metric_type: 'count',
        target: 5,
        target_secondary: null,
        recurrence: 'daily',
        is_counter_mode: false,
        privacy_level: 'ratio',
        sub_items: null,
    };

    console.log("Inserting deed...");
    const { data, error } = await supabase
        .from('deeds')
        .insert(deedData)
        .select()
        .single();

    if (error) {
        console.error("INSERT FAILED:", error);
    } else {
        console.log("SUCCESS:", data);
    }
}

testInsertDeed();
