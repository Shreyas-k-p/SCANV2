/**
 * Import Firebase export data into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ohkrzxcmueodijbhxxgx.supabase.co';
const supabaseKey = 'sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK';

const supabase = createClient(supabaseUrl, supabaseKey);

const importData = async () => {
    try {
        console.log('🚀 Starting Supabase import...\n');

        // Read exported data
        const data = JSON.parse(fs.readFileSync('./firebase_export.json', 'utf8'));

        // Import menu items
        console.log('📦 Importing menu items...');
        if (data.menu_items && data.menu_items.length > 0) {
            const { error: menuError } = await supabase
                .from('menu_items')
                .insert(data.menu_items);

            if (menuError) {
                console.error('❌ Menu items import error:', menuError.message);
            } else {
                console.log(`✅ Imported ${data.menu_items.length} menu items`);
            }
        }

        // Import tables
        console.log('📦 Importing tables...');
        if (data.tables && data.tables.length > 0) {
            const { error: tablesError } = await supabase
                .from('tables')
                .insert(data.tables);

            if (tablesError) {
                console.error('❌ Tables import error:', tablesError.message);
            } else {
                console.log(`✅ Imported ${data.tables.length} tables`);
            }
        }

        // Import orders
        console.log('📦 Importing orders...');
        if (data.orders && data.orders.length > 0) {
            const { error: ordersError } = await supabase
                .from('orders')
                .insert(data.orders);

            if (ordersError) {
                console.error('❌ Orders import error:', ordersError.message);
            } else {
                console.log(`✅ Imported ${data.orders.length} orders`);
            }
        }

        // Import staff profiles
        console.log('📦 Importing staff profiles...');
        if (data.profiles && data.profiles.length > 0) {
            // Filter out MGR5710 as it already exists
            const profilesToImport = data.profiles.filter(p => p.staff_id !== 'MGR5710');

            if (profilesToImport.length > 0) {
                const { error: profilesError } = await supabase
                    .from('profiles')
                    .insert(profilesToImport);

                if (profilesError) {
                    console.error('❌ Profiles import error:', profilesError.message);
                } else {
                    console.log(`✅ Imported ${profilesToImport.length} staff profiles`);
                }
            }
        }

        console.log('\n✅ Import complete!\n');
        console.log('📊 Summary:');
        console.log(`   - Menu Items: ${data.menu_items?.length || 0}`);
        console.log(`   - Orders: ${data.orders?.length || 0}`);
        console.log(`   - Tables: ${data.tables?.length || 0}`);
        console.log(`   - Staff Profiles: ${data.profiles?.length || 0}`);

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
};

importData();
