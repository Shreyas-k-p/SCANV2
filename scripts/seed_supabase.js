import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Seeding Supabase database...");

  // 1. Seed Tables
  const tables = [
    { table_number: 'T01', active: true, is_calling: false },
    { table_number: 'T02', active: true, is_calling: false },
    { table_number: 'T03', active: true, is_calling: false },
    { table_number: 'T04', active: true, is_calling: false },
    { table_number: 'T05', active: true, is_calling: false },
  ];

  const { error: tableError } = await supabase.from('tables').upsert(tables, { onConflict: 'table_number' });
  if (tableError) console.warn("Table seed warning (might already exist):", tableError.message);
  else console.log("✅ Tables seeded");

  // 2. Seed Menu Items
  const menuItems = [
    { 
      name: 'Paneer Butter Masala', 
      price: 280, 
      category: 'Main Course', 
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      benefits: 'Rich, creamy, and mildly sweet paneer cubes in tomato gravy.',
      available: true
    },
    { 
      name: 'Classic Veg Pizza', 
      price: 350, 
      category: 'Fast Food', 
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      benefits: 'Fresh vegetables, mozzarella cheese, and signature tomato sauce.',
      available: true
    },
    { 
      name: 'Masala Dosa', 
      price: 120, 
      category: 'Breakfast', 
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400',
      benefits: 'Crispy rice crepe filled with spiced potato masala.',
      available: true
    },
    { 
      name: 'Refreshing Fruit Punch', 
      price: 150, 
      category: 'Beverages', 
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
      benefits: 'Chilled blend of seasonal fruit juices with a dash of lime.',
      available: true
    },
    { 
      name: 'Gulab Jamun', 
      price: 90, 
      category: 'Desserts', 
      image: 'https://images.unsplash.com/photo-1542310503-49dc8b12270b?w=400',
      benefits: 'Warm milk-solid balls soaked in aromatic cardamom syrup.',
      available: true
    }
  ];

  const { error: menuError } = await supabase.from('menu_items').upsert(menuItems, { onConflict: 'name' });
  if (menuError) console.warn("Menu items seed warning:", menuError.message);
  else console.log("✅ Menu items seeded");

  // 3. Seed Users/Staff WITH Auth accounts
  const staffToCreate = [
    { 
      staff_id: 'SUPER101', 
      name: 'Super Admin', 
      role: 'MANAGER', 
      email: 'SUPER101@scan4serve.com',
      secret_id: 'admin123'
    },
    { 
      staff_id: 'MGR201', 
      name: 'Restaurant Manager', 
      role: 'MANAGER', 
      email: 'MGR201@scan4serve.com',
      secret_id: 'manager123'
    },
    { 
      staff_id: 'MGR5710', 
      name: 'Manager 5710', 
      role: 'MANAGER', 
      email: 'MGR5710@scan4serve.com',
      secret_id: '5710'
    },
    { 
      staff_id: 'WAIT301', 
      name: 'John Waiter', 
      role: 'WAITER', 
      email: 'WAIT301@scan4serve.com',
      secret_id: 'john123'
    }
  ];

  console.log("🔑 Creating Auth accounts and profiles...");
  
  for (const staff of staffToCreate) {
    // 1. Create Auth User using service_role to bypass email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: staff.email,
      password: staff.secret_id,
      email_confirm: true,
      user_metadata: { name: staff.name, role: staff.role }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log(`ℹ️ Auth user ${staff.email} already exists.`);
        // Try to fetch existing user to get ID for profile sync
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === staff.email);
        if (existingUser) {
           await syncProfile(existingUser.id, staff);
        }
      } else {
        console.error(`❌ Error creating auth user ${staff.email}:`, authError.message);
      }
      continue;
    }

    if (authData.user) {
      console.log(`✅ Auth user created: ${staff.email}`);
      await syncProfile(authData.user.id, staff);
    }
  }

  async function syncProfile(userId, staff) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      staff_id: staff.staff_id,
      name: staff.name,
      role: staff.role,
      email: staff.email,
      secret_id: staff.secret_id
    }, { onConflict: 'staff_id' });

    if (profileError) console.error(`❌ Profile sync error for ${staff.email}:`, profileError.message);
    else console.log(`✅ Profile synced for ${staff.email}`);
  }

  console.log("🏁 Seeding complete!");
}

seed();
