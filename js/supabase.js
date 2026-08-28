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

// Target Notification Contacts
const NOTIFICATION_WHATSAPP = "97145534286";
const NOTIFICATION_EMAIL = "inquiry@alyakda.com";

// Dynamic Supabase Credentials Helper
function getSupabaseCredentials() {
  const savedUrl = localStorage.getItem('yakda_supabase_url');
  const savedKey = localStorage.getItem('yakda_supabase_key');
  const url = savedUrl || window.SUPABASE_CONFIG?.url || "https://aljcnbyzixcqfhqmcqqn.supabase.co";
  const key = savedKey || window.SUPABASE_CONFIG?.key || "sb_publishable_UXTg0SKcG9ErZPj53XaLeg_HtpUc_EK";
  return { url, key, isSaved: Boolean(savedUrl && savedKey) };
}

// Initialize Supabase Client
let supabaseClient = null;

function initSupabaseClient() {
  const { url, key } = getSupabaseCredentials();
  if (typeof supabase !== 'undefined' && url && url !== "https://your-project.supabase.co" && key && key !== "your-anon-key") {
    try {
      supabaseClient = supabase.createClient(url, key);
      console.log("Supabase Client initialized successfully for URL:", url);
      return true;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      supabaseClient = null;
      return false;
    }
  }
  supabaseClient = null;
  return false;
}

// Auto-initialize on script load
initSupabaseClient();

// Save Supabase Configuration
function saveSupabaseConfig(url, key) {
  const cleanUrl = (url || '').trim();
  const cleanKey = (key || '').trim();
  if (cleanUrl) localStorage.setItem('yakda_supabase_url', cleanUrl);
  if (cleanKey) localStorage.setItem('yakda_supabase_key', cleanKey);
  return initSupabaseClient();
}

// Clear Supabase Configuration
function clearSupabaseConfig() {
  localStorage.removeItem('yakda_supabase_url');
  localStorage.removeItem('yakda_supabase_key');
  supabaseClient = null;
}

// Connection Status Check
function isSupabaseConnected() {
  return initSupabaseClient() && Boolean(supabaseClient);
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

  const users = JSON.parse(localStorage.getItem('yakda_users_collection') || '[]');
  users.push(userData);
  localStorage.setItem('yakda_users_collection', JSON.stringify(users));
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

  const users = JSON.parse(localStorage.getItem('yakda_users_collection') || '[]');
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) || null;
}

// ==========================================
// PRODUCT COLLECTION API
// ==========================================

async function getProductsFromCloud() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase products fetch error:", e);
    }
  }

  return JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
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

  const existing = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
  existing.unshift(record);
  localStorage.setItem('yakda_custom_products', JSON.stringify(existing));
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

  let existing = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
  const idx = existing.findIndex(p => p.id === productData.id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...record };
  } else {
    existing.unshift(record);
  }
  localStorage.setItem('yakda_custom_products', JSON.stringify(existing));
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

  let existing = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
  existing = existing.filter(p => p.id !== productId);
  localStorage.setItem('yakda_custom_products', JSON.stringify(existing));
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

  const orders = JSON.parse(localStorage.getItem('yakda_orders_collection') || '[]');
  orders.unshift(record);
  localStorage.setItem('yakda_orders_collection', JSON.stringify(orders));
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
