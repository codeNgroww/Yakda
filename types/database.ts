export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  created_at?: string;
};

export type SubCategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: string;
  sku: string;
  title: string;
  description?: string | null;
  price: number;
  category: string;
  badge?: string | null;
  image: string;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  password?: string;
  fullname?: string | null;
  companyname?: string | null;
  account_type?: 'individual' | 'corporate' | 'admin';
  is_admin?: boolean;
  created_at?: string;
};

export type CartItem = {
  id: string;
  sku: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  customer_email: string;
  items: CartItem[];
  total_amount: number;
  status: string;
  contact_phone?: string;
  delivery_address?: string;
  created_at?: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
};
