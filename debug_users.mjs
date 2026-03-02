import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ohkrzxcmueodijbhxxgx.supabase.co';
const supabaseAnonKey = 'sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
    console.log("Fetching all profiles...");
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Profiles found:", data.length);
        data.forEach(p => {
            console.log(`- ID: ${p.staff_id}, Role: ${p.role}, Name: ${p.name}, Secret: ${p.secret_id}`);
        });
    }
}

checkUsers();
