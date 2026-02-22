import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullFlow() {
    console.log("Signing up random test user...");
    const email = `test_${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
            data: {
                full_name: 'Test Setup',
                phone: `+9665${Math.floor(Math.random() * 100000000)}`
            }
        }
    });

    if (authError) {
        console.error("SignUp failed:", authError);
        return;
    }

    const userId = authData.user.id;
    console.log("Logged in as / Signed up as", userId);

    console.log("Checking if profile exists...");
    const { data: pData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!pData) console.log("Profile not found! Trigger didn't work?");
    else console.log("Profile ok:", pData);

    console.log("Attempting to insert a deed...");
    const deedData = {
        user_id: userId,
        group_id: 'personal',
        worship_type: 'body',
        name: 'test deed',
        metric_type: 'count',
        target: 5,
        recurrence: 'daily',
        is_counter_mode: false,
        privacy_level: 'ratio'
    };

    const { data: dData, error: dError } = await supabase
        .from('deeds')
        .insert(deedData)
        .select()
        .single();

    if (dError) {
        console.error("DEED INSERT FAILED:", dError);
    } else {
        console.log("DEED INSERT SUCCESS:", dData.id);
    }

    console.log("Attempting to create a group...");
    const { data: gData, error: gError } = await supabase
        .from('groups')
        .insert({
            name: 'Test Group',
            admin_id: userId,
            grace_period_hours: 6,
            visibility: 'private'
        })
        .select()
        .single();

    if (gError) {
        console.error("GROUP INSERT FAILED:", gError);
    } else {
        console.log("GROUP INSERT SUCCESS:", gData.id);
    }

    console.log("Attempting to update profile...");
    const { data: uData, error: uError } = await supabase
        .from('profiles')
        .update({ name: 'New Name' })
        .eq('id', userId)
        .select()
        .single();

    if (uError) {
        console.error("PROFILE UPDATE FAILED:", uError);
    } else {
        console.log("PROFILE UPDATE SUCCESS:", uData.name);
    }
}

testFullFlow();
