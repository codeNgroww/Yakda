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

export async function fetchAllProductsForExport(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products for export:', error);
    return [];
  }
  return data || [];
}

export async function fetchPaginatedProducts(
  page: number = 1,
  pageSize: number = 20,
  searchQuery: string = '',
  categoryFilter: string = 'all'
): Promise<{ products: Product[]; totalCount: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  let query = supabase.from('products').select('*', { count: 'exact' });

  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }

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
  
  // Standard storefront categories with clean display names & icons
  const standardStorefrontCategories: Category[] = [
    { id: 'cat-all', name: 'All Categories', slug: 'all', icon: 'border_all' },
    { id: 'cat-writing', name: 'Writing & Pens', slug: 'writing', icon: 'edit_note' },
    { id: 'cat-paper', name: 'Paper & Envelopes', slug: 'paper', icon: 'description' },
    { id: 'cat-machines', name: 'Office Machines', slug: 'machines', icon: 'print' },
    { id: 'cat-furniture', name: 'Executive Furniture', slug: 'furniture', icon: 'desk' },
    { id: 'cat-eco', name: 'Eco Friendly Picks', slug: 'eco', icon: 'eco' },
    { id: 'cat-kawaii', name: 'Kawaii Stationery', slug: 'kawaii', icon: 'favorite' },
    { id: 'cat-books', name: 'Books & Novels', slug: 'books', icon: 'menu_book' },
    { id: 'cat-toys', name: 'Toys & Games', slug: 'toys', icon: 'toys' },
    { id: 'cat-crafts', name: 'Arts & Crafts', slug: 'crafts', icon: 'palette' },
    { id: 'cat-labels', name: 'Labels & Tapes', slug: 'labels', icon: 'label' },
    { id: 'cat-binders', name: 'Binders & Filing', slug: 'binders', icon: 'folder_open' },
    { id: 'cat-basics', name: 'Office Supplies', slug: 'basics', icon: 'inventory_2' },
    { id: 'cat-boards', name: 'Boards & Easels', slug: 'boards', icon: 'dashboard' },
    { id: 'cat-storage', name: 'Storage Solutions', slug: 'storage', icon: 'inventory' },
    { id: 'cat-shipping', name: 'Mailing & Shipping', slug: 'shipping', icon: 'local_shipping' },
    { id: 'cat-print-copy', name: 'Print Room', slug: 'print-copy', icon: 'file_copy' },
    { id: 'cat-computers', name: 'Computers & Tech', slug: 'computers', icon: 'laptop_mac' },
  ];

  const categoryMap = new Map<string, Category>();
  standardStorefrontCategories.forEach(c => categoryMap.set(c.slug, c));

  // 1. Merge categories table
  const { data: dbCategories } = await supabase.from('categories').select('*');
  if (dbCategories) {
    dbCategories.forEach((c: any) => {
      if (c.slug) {
        const existing = categoryMap.get(c.slug);
        categoryMap.set(c.slug, {
          id: c.id || existing?.id || c.slug,
          name: c.name || existing?.name || c.slug,
          slug: c.slug,
          icon: c.icon || existing?.icon || 'category'
        });
      }
    });
  }

  // 2. Collect any unique categories stored on existing products
  const { data: productCats } = await supabase.from('products').select('category');
  if (productCats) {
    productCats.forEach((p: any) => {
      if (p.category && p.category.trim()) {
        const slug = p.category.trim().toLowerCase();
        if (!categoryMap.has(slug)) {
          const formattedName = slug
            .split(/[-_]+/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          categoryMap.set(slug, {
            id: `prod-cat-${slug}`,
            name: formattedName,
            slug: slug,
            icon: 'category'
          });
        }
      }
    });
  }

  return Array.from(categoryMap.values());
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
