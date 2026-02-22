import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { phone: '+966543287627', name: 'نوني 911', email: 'nuni@911.com', password: 'najaM911#' },
    { phone: '+966555522435', name: 'محب', email: 'm@m.com', password: '123321' },
    { phone: '+966550881202', name: 'أبو يوسف', email: 'a@w.com', password: '112233' },
    { phone: '+966545584500', name: 'اللوتس', email: 'rose@rose.com', password: '112211' },
    { phone: '+966538626546', name: 'عبدالله بخش', email: 'a@a.com', password: '332211' },
    { phone: '+966532601012', name: 'ليمو', email: 'l@l.com', password: '121213' },
    { phone: '+966540071356', name: 'الشيماوية', email: 's@s.com', password: '131212' },
    { phone: '+966582095936', name: 'لولو', email: 'p@p.com', password: '131213' }
];

async function seed() {
    console.log("Starting to create users...\n");
    for (const u of users) {
        console.log(`Creating user: ${u.name} (${u.email})`);

        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
            options: {
                data: {
                    full_name: u.name,
                    phone: u.phone
                }
            }
        });

        if (error) {
            console.error(`❌ Error creating ${u.name}: ${error.message}`);
        } else {
            console.log(`✅ Success: ${u.name} created! (ID: ${data.user?.id})`);
        }
    }
    console.log("\nFinished user creation script.");
}

seed();
