/**
 * Supabase Database & Storage Bucket Integration Helper
 * 
 * --- SUPABASE SQL SCHEMA CREATION SCRIPT ---
 * Execute the following SQL queries in your Supabase SQL Editor:
 * 
 * -- 1. Create Users Table
 * CREATE TABLE public.users (
 *   id TEXT PRIMARY KEY,
 *   email TEXT UNIQUE NOT NULL,
 *   password TEXT NOT NULL,
 *   fullname TEXT,
 *   companyname TEXT,
 *   account_type TEXT DEFAULT 'individual',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 2. Create Products Table
 * CREATE TABLE public.products (
 *   id TEXT PRIMARY KEY,
 *   sku TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   price NUMERIC NOT NULL,
 *   category TEXT NOT NULL,
 *   badge TEXT,
 *   image TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 3. Create Cart Table
 * CREATE TABLE public.cart (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   product_id TEXT NOT NULL,
 *   quantity INTEGER DEFAULT 1,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 4. Create Orders Table
 * CREATE TABLE public.orders (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   customer_email TEXT NOT NULL,
 *   items JSONB NOT NULL,
 *   total_amount NUMERIC NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   contact_phone TEXT,
 *   delivery_address TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 */

// Supabase Credentials
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.key || "your-anon-key";

// Target Notification Contacts
const NOTIFICATION_WHATSAPP = "97145534286";
const NOTIFICATION_EMAIL = "inquiry@alyakda.com";

// Initialize Supabase Client
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== "https://your-project.supabase.co") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase Client initialized successfully.");
} else {
  console.log("Supabase SDK ready. Operating with local persistent database fallback.");
}

const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200 KB limit

/**
 * Validate image file size (Strict 200 KB Limit)
 */
function validateFileSize(file) {
  if (!file) return { valid: false, message: 'No file selected' };
  
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const fileSizeKB = (file.size / 1024).toFixed(1);
    return {
      valid: false,
      message: `File size (${fileSizeKB} KB) exceeds maximum limit of 200 KB. Please upload a smaller image file.`
    };
  }
  return { valid: true };
}

/**
 * Upload Image to Supabase Storage Bucket ('product-images')
 */
async function uploadImageToCloud(file) {
  const validation = validateFileSize(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (supabaseClient) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabaseClient.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.warn("Supabase Storage upload error:", error.message);
      return await fileToDataURL(file);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  return await fileToDataURL(file);
}

// ==========================================
// USER COLLECTION API
// ==========================================

async function saveUserToCloud(userData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .insert([{
          id: userData.id || Date.now().toString(),
          email: userData.email,
          password: userData.password,
          fullname: userData.fullname || null,
          companyname: userData.companyname || null,
          account_type: userData.account_type || 'individual',
          created_at: new Date().toISOString()
        }])
        .select();

      if (!error && data) return data[0];
    } catch (e) {
      console.warn("Supabase user insert error:", e);
    }
  }

  const users = JSON.parse(localStorage.getItem('officeone_users_collection') || '[]');
  users.push(userData);
  localStorage.setItem('officeone_users_collection', JSON.stringify(users));
  return userData;
}

async function findUserInCloud(email, password) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase user fetch error:", e);
    }
  }

  const users = JSON.parse(localStorage.getItem('officeone_users_collection') || '[]');
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) || null;
}

// ==========================================
// PRODUCT COLLECTION API
// ==========================================

// Seed default database catalog if uninitialized
const INITIAL_DB_PRODUCTS = [
  {
    id: '8494',
    sku: '8494',
    title: "CARAN d'ACHE 849 Ballpoint Pen with Box, Fluo Green",
    category: 'writing',
    price: 105.00,
    badge: null,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLudFMyR7esMcv47JKmGuefiRNQAsGj7ylblt214Xtsq1InvpFG6D9fenxgnyVfv25QvzAcrrrwaisKG7n_Hy8QC-20mERJF-GS1QmL9RZcG5nEHvum-HMBkC2CEQeFAzBl8KJbNxQVCClRRXaR01zBjPZgbqLRPP-Gmn9SG856c0fTXR7EfdWon9xzdAYoKapiIJlOZtipO4umABNQCfhAaoh6QfHSmb-LBz1SQNXDszr8bmtFkIt_Gr50"
  },
  {
    id: '10558',
    sku: '10558',
    title: "Durable Idealbox Pen Tray, 240 x 36 x 340 mm, Charcoal",
    category: 'writing',
    price: 32.00,
    badge: null,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsP4BxBYis1NyQH4HmpKJEII5OG52HmSmF18yj0lSwFzw3ritum_BQGrcurmOLgwX_dRFCbygHV4QFxuonOeBg7fif4aoJ6s0xHC_V3uYuVGIEez4PrmT_hFShsVzC79ki8XRnSUnCFMo3vof48IlZsAEcXygYVex8j4opAxcbCAg2AAG7QIoXdlobg2wuzm-u8IjeMbKZG3cCfp-O3_n4j8qXvXFpv3ylTlhqdSQK3xrTZ8VM8IhQcNxqw"
  },
  {
    id: '18280',
    sku: '18280',
    title: "HP SMART TANK 581 All-In-One PRINTER",
    category: 'machines',
    price: 567.00,
    badge: "Best Seller",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsnXIkp71JNtw6q2E5Vj_pNQ25N1EXtsDrIZItQzafRMaxnp8LcCyZ0R_OBytNWZJjGMGtTJx5joTFD0ntF2oNoxPciBe8Gn419QlCOTIdTPODbmaHCtDbTWHwFpRUZxM2I_sVjjyJIFENAMfc1oFt6ZcETgzgCR_f9Mz1Fxm1kKIpQCURfE1JqhEbTviprZUsIn5A-Mbc0lpieyYGthGx4atU0r936RNnat5fX2zw83D_o8BkIrwa0avIU"
  },
  {
    id: '10764',
    sku: '10764',
    title: "Topstar OPEN POINT SY Mesh Office Chair",
    category: 'furniture',
    price: 1732.00,
    badge: null,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtMLxM-gE6v9qIjQeEynaHEgfovn2cQzVlVbxB1h1wB85brtNLctEv2RvtWd2iMjRfjXNgbKe7rXFYfbZfzItwFeiM4bNJ4O3abbJfXgptL6DE47vaiNQK-g2l7A-8HAmFkdjlolg2153frNS5alBCzb308Lqj7XPdqy6NvVMPYa65wccTe83-zhVm8TmTT8FsMox-FwXVvhqXJHG38eJePLIqHVbUhqa1RFwjGMTD2hS6nPZpQ2rdLzoO_"
  },
  {
    id: '0095',
    sku: '0095',
    title: "Double A Copy Paper A4 Ream 80gsm 500 Sheets",
    category: 'paper',
    price: 18.50,
    badge: "Popular",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLu3CD2EWiRf9i92cI2Fhnm6GV8ONxU6fzB8onJEkIe8bgRBn03SuuhsvE7LirqzP07FEyumtobzV2WBBUvAzkqo5zZ4KqXt4stbw6UfnSuoTWjkaH8kl3HXTsGYGRoGrjSmN4Wl1YvkeCmbXsAlKN-NOqlPOPuJm-TNuVEWisVRTsxcM2ihsvcI2HIRWvTFtfyFcNUevWha01leTLN_1n0XwbvT9NxlXA85Jt2db6IWqHxxMiaMV96cAKNH"
  },
  {
    id: '11767',
    sku: '11767',
    title: "Durable Varicolor SAFE File Cabinet 4 Drawers",
    category: 'furniture',
    price: 485.00,
    badge: null,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLvpf2gmdymXoTGN95-nVvD3tznFO6sipv_s0GTZzKZywIDFhLYUDK-YVV54wUPj8KypBkOwyR49UDOM0qDxs4wQkSRZeyLHTNaNpVqvwZFPhzPnPCk9KSVuWP4aXcrfGafXDaT59wE27Nom8vvsdGVWB9GVp2p7z-gzKkVFWTaOJPRZwEmxXMyxbZVHSCOPb88WJcHUrER_gTG7DC-43lt8V213XiES-9uPS_wBP45SH9t6bnZ3dAmNn-7D"
  }
];

if (!localStorage.getItem('officeone_custom_products')) {
  localStorage.setItem('officeone_custom_products', JSON.stringify(INITIAL_DB_PRODUCTS));
}

async function getProductsFromCloud() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase products fetch error:", e);
    }
  }

  return JSON.parse(localStorage.getItem('officeone_custom_products') || '[]');
}

async function saveProductToCloud(productData) {
  const record = {
    id: productData.id || Date.now().toString(),
    sku: productData.sku,
    title: productData.title,
    description: productData.description || '',
    price: productData.price,
    category: productData.category,
    badge: productData.badge || null,
    image: productData.image,
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .insert([record])
        .select();

      if (!error && data) console.log("Saved product to Supabase:", data);
    } catch (e) {
      console.warn("Supabase product insert error:", e);
    }
  }

  const existing = JSON.parse(localStorage.getItem('officeone_custom_products') || '[]');
  existing.unshift(record);
  localStorage.setItem('officeone_custom_products', JSON.stringify(existing));
}

async function updateProductInCloud(productData) {
  const record = {
    id: productData.id,
    sku: productData.sku,
    title: productData.title,
    description: productData.description || '',
    price: productData.price,
    category: productData.category,
    badge: productData.badge || null,
    image: productData.image
  };

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update(record)
        .eq('id', productData.id)
        .select();

      if (!error && data) console.log("Updated product in Supabase:", data);
    } catch (e) {
      console.warn("Supabase product update error:", e);
    }
  }

  let existing = JSON.parse(localStorage.getItem('officeone_custom_products') || '[]');
  const idx = existing.findIndex(p => p.id === productData.id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...record };
  } else {
    existing.unshift(record);
  }
  localStorage.setItem('officeone_custom_products', JSON.stringify(existing));
}

async function deleteProductFromCloud(productId) {
  if (supabaseClient) {
    try {
      await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId);
    } catch (e) {
      console.warn("Supabase product delete error:", e);
    }
  }

  let existing = JSON.parse(localStorage.getItem('officeone_custom_products') || '[]');
  existing = existing.filter(p => p.id !== productId);
  localStorage.setItem('officeone_custom_products', JSON.stringify(existing));
}

// ==========================================
// ORDERS COLLECTION API
// ==========================================

async function createOrderInCloud(orderData) {
  const record = {
    id: orderData.id || `ORD-${Date.now()}`,
    user_id: orderData.user_id || 'guest',
    customer_email: orderData.customer_email,
    items: orderData.items,
    total_amount: orderData.total_amount,
    status: 'pending',
    contact_phone: orderData.contact_phone || '',
    delivery_address: orderData.delivery_address || '',
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([record])
        .select();

      if (!error && data) {
        console.log("Order created in Supabase DB:", data);
        return data[0];
      }
    } catch (e) {
      console.warn("Supabase order insert error:", e);
    }
  }

  const orders = JSON.parse(localStorage.getItem('officeone_orders_collection') || '[]');
  orders.unshift(record);
  localStorage.setItem('officeone_orders_collection', JSON.stringify(orders));
  return record;
}

// Helper: Convert file to Base64
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
