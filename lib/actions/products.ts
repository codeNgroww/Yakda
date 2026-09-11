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
  
  // Flatten product_collections if available for easier frontend access
  const formattedData = data.map((p: any) => ({
    ...p,
    collection_ids: p.product_collections?.map((pc: any) => pc.collection_id) || []
  }));
  
  return formattedData || [];
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

  let baseCategories = data || [];
  if (error || baseCategories.length === 0) {
    console.error('Error fetching categories or empty:', error?.message);
    baseCategories = [
      { id: '1', name: 'All', slug: 'all', icon: 'border_all' },
      { id: '2', name: 'Writing & Pens', slug: 'writing', icon: 'edit_note' },
      { id: '3', name: 'Paper & Envelopes', slug: 'paper', icon: 'description' },
      { id: '4', name: 'Office Machines', slug: 'machines', icon: 'print' },
      { id: '5', name: 'Executive Furniture', slug: 'furniture', icon: 'desk' },
    ];
  }

  // Inject requested virtual categories at the top so they appear in the pill bar
  const virtualCategories: Category[] = [
    { id: 'vc-eco', name: 'Eco Friendly Picks', slug: 'eco', icon: 'eco' },
    { id: 'vc-kawaii', name: 'Kawaii Stationery', slug: 'kawaii', icon: 'favorite' },
    { id: 'vc-books', name: 'Books & Novels', slug: 'books', icon: 'menu_book' },
    { id: 'vc-toys', name: 'Toys & Games', slug: 'toys', icon: 'toys' },
    { id: 'vc-crafts', name: 'Arts & Crafts', slug: 'crafts', icon: 'palette' }
  ];

  // Merge avoiding duplicates by slug
  const allCategories = [...baseCategories];
  for (const vc of virtualCategories) {
    if (!allCategories.some(c => c.slug === vc.slug)) {
      allCategories.push(vc);
    }
  }

  return allCategories;
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
    return [];
  }
  return data || [];
}

export async function fetchCollections(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*');

  if (error) {
    console.error('Error fetching collections:', error);
    return [];
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

export async function createCategory(categoryData: Partial<Category>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}
