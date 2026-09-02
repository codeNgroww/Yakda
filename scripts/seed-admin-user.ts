import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase URL or Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdminUser() {
  console.log('Seeding admin@yakda.ae user into Supabase users table...');

  const adminEmail = 'admin@yakda.ae';
  const adminPass = 'admin123';
  const adminId = 'admin-yakda-001';

  // 1. Try upserting into public.users table
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: adminId,
        email: adminEmail,
        password: adminPass,
        fullname: 'Yakda Administrator',
        companyname: 'Yakda Corporate Head Office',
        account_type: 'admin',
        is_admin: true,
      },
      { onConflict: 'email' }
    )
    .select();

  if (error) {
    console.error('Database users table upsert notice:', error.message);
  } else {
    console.log('Admin user successfully seeded into public.users database table!', data);
  }
}

seedAdminUser().catch((e) => console.error(e));
