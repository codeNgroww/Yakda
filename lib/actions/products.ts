'use server';

import { createClient } from '@/lib/supabase/server';
import { Product, Category } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function fetchTotalProductCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total product count:', error);
    return 0;
  }
  return count || 0;
}

export async function fetchPaginatedProducts(
  page: number = 1,
  pageSize: number = 20,
  searchQuery: string = ''
): Promise<{ products: Product[]; totalCount: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  let query = supabase.from('products').select('*', { count: 'exact' });

  if (searchQuery.trim()) {
    const q = `%${searchQuery.trim().toLowerCase()}%`;
    query = query.or(`title.ilike.${q},sku.ilike.${q},category.ilike.${q}`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated products:', error);
    return { products: [], totalCount: 0 };
  }

  return {
    products: data || [],
    totalCount: count || 0,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    return [
      { id: '1', name: 'All', slug: 'all', icon: 'border_all' },
      { id: '2', name: 'Writing & Pens', slug: 'writing', icon: 'edit_note' },
      { id: '3', name: 'Paper & Envelopes', slug: 'paper', icon: 'description' },
      { id: '4', name: 'Office Machines', slug: 'machines', icon: 'print' },
      { id: '5', name: 'Executive Furniture', slug: 'furniture', icon: 'desk' },
    ];
  }
  return data || [];
}

export async function fetchSubCategories(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Subcategories table notice:', error.message);
    return [
      { id: 'sc-1', category_id: '2', name: 'Pens & Ballpoints', slug: 'writing' },
      { id: 'sc-2', category_id: '2', name: 'Pencils & Lead', slug: 'writing' },
      { id: 'sc-3', category_id: '2', name: 'Markers & Highlighters', slug: 'writing' },
      { id: 'sc-4', category_id: '3', name: 'Copy & Printing Paper', slug: 'paper' },
      { id: 'sc-5', category_id: '3', name: 'Notebooks & Pads', slug: 'paper' },
      { id: 'sc-6', category_id: '3', name: 'Labels & Tapes', slug: 'labels' },
      { id: 'sc-7', category_id: '3', name: 'Binders & Accessories', slug: 'binders' },
      { id: 'sc-8', category_id: '4', name: 'Printers & Technology', slug: 'machines' },
      { id: 'sc-9', category_id: '4', name: 'Shredders & Cutters', slug: 'machines' },
      { id: 'sc-10', category_id: '5', name: 'Boards & Easels', slug: 'boards' },
      { id: 'sc-11', category_id: '5', name: 'Storage & Cabinets', slug: 'storage' },
    ];
  }
  return data || [];
}

export async function createProduct(productData: Partial<Product>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}
