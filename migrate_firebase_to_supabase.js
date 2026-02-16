/**
 * Firebase to Supabase Data Migration Script
 * 
 * This script exports all data from Firebase and prepares it for Supabase import
 * Run this script BEFORE switching to Supabase in the application
 */

import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const exportCollection = async (collectionName) => {
    console.log(`📦 Exporting ${collectionName}...`);
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    console.log(`✅ Exported ${data.length} documents from ${collectionName}`);
    return data;
};

const main = async () => {
    try {
        console.log('🚀 Starting Firebase to Supabase migration...\n');

        // Export all collections
        const menuItems = await exportCollection('menuItems');
        const orders = await exportCollection('orders');
        const waiters = await exportCollection('waiters');
        const kitchenStaff = await exportCollection('kitchenStaff');
        const managers = await exportCollection('managers');
        const subManagers = await exportCollection('subManagers');
        const tables = await exportCollection('tables');

        // Transform data for Supabase format
        const migrationData = {
            menu_items: menuItems.map(item => ({
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.description || '',
                image: item.image || '',
                available: item.available !== false,
                benefits: item.benefits || '',
                created_at: item.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            })),

            orders: orders.map(order => ({
                order_id: order.id,
                table_number: order.tableNo || order.table_number || '',
                customer_name: order.customerInfo?.name || order.customerName || '',
                customer_mobile: order.customerInfo?.mobile || order.customerMobile || '',
                items: order.items || [],
                total_amount: order.totalAmount || 0,
                status: order.status || 'pending',
                assigned_waiter: order.assignedWaiter || '',
                notes: order.notes || '',
                created_at: order.timestamp || order.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            })),

            profiles: [
                // Managers
                ...managers.map(mgr => ({
                    staff_id: mgr.id,
                    role: 'MANAGER',
                    name: mgr.name,
                    profile_photo: mgr.profilePhoto || '',
                    secret_id: mgr.secretID || mgr.secretId || '',
                    email: mgr.email || ''
                })),
                // Sub-Managers
                ...subManagers.map(sm => ({
                    staff_id: sm.id,
                    role: 'SUB_MANAGER',
                    name: sm.name,
                    profile_photo: sm.profilePhoto || '',
                    secret_id: sm.secretID || sm.secretId || '',
                    email: sm.email || ''
                })),
                // Waiters
                ...waiters.map(waiter => ({
                    staff_id: waiter.id,
                    role: 'WAITER',
                    name: waiter.name,
                    profile_photo: waiter.profilePhoto || '',
                    secret_id: waiter.secretID || waiter.secretId || '',
                    email: waiter.email || ''
                })),
                // Kitchen Staff
                ...kitchenStaff.map(staff => ({
                    staff_id: staff.id,
                    role: 'KITCHEN',
                    name: staff.name,
                    profile_photo: staff.profilePhoto || '',
                    secret_id: staff.secretID || staff.secretId || '',
                    email: staff.email || ''
                }))
            ],

            tables: tables.map(table => ({
                table_number: table.tableNo || table.table_number || table.id,
                capacity: table.capacity || 4,
                status: table.status || 'available',
                qr_code: table.qrCode || ''
            }))
        };

        // Save to JSON file
        const outputPath = './firebase_export.json';
        fs.writeFileSync(outputPath, JSON.stringify(migrationData, null, 2));

        console.log('\n✅ Migration data exported successfully!');
        console.log(`📁 File saved to: ${outputPath}`);
        console.log('\n📊 Summary:');
        console.log(`   - Menu Items: ${migrationData.menu_items.length}`);
        console.log(`   - Orders: ${migrationData.orders.length}`);
        console.log(`   - Staff Profiles: ${migrationData.profiles.length}`);
        console.log(`   - Tables: ${migrationData.tables.length}`);
        console.log('\n📝 Next steps:');
        console.log('   1. Run the Supabase schema SQL in your Supabase dashboard');
        console.log('   2. Use the import script to load this data into Supabase');
        console.log('   3. Verify data in Supabase dashboard');
        console.log('   4. Update application to use Supabase\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

main();
