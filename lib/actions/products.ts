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

import { STANDARD_CATEGORIES, normalizeCategorySlug, getCategoryAliases, isCategoryMatch } from '@/lib/utils/categories';

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
    const aliases = getCategoryAliases(categoryFilter);
    const orFilter = aliases.map(a => `category.ilike.${a}`).join(',');
    query = query.or(orFilter);
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
  
  const categoryMap = new Map<string, Category>();
  
  STANDARD_CATEGORIES.forEach(c => {
    categoryMap.set(c.slug, {
      id: `cat-${c.slug}`,
      name: c.name,
      slug: c.slug,
      icon: c.icon
    });
  });

  // 1. Merge categories table
  const { data: dbCategories } = await supabase.from('categories').select('*');
  if (dbCategories) {
    dbCategories.forEach((c: any) => {
      if (c.slug || c.name) {
        const normSlug = normalizeCategorySlug(c.slug || c.name);
        const existing = categoryMap.get(normSlug);
        if (existing) {
          categoryMap.set(normSlug, {
            ...existing,
            id: c.id || existing.id,
            name: existing.name,
          });
        } else {
          categoryMap.set(normSlug, {
            id: c.id || normSlug,
            name: c.name || normSlug,
            slug: normSlug,
            icon: c.icon || 'category'
          });
        }
      }
    });
  }

  // 2. Collect any unique categories stored on existing products
  const { data: productCats } = await supabase.from('products').select('category');
  if (productCats) {
    productCats.forEach((p: any) => {
      if (p.category && p.category.trim()) {
        const normSlug = normalizeCategorySlug(p.category.trim());
        if (!categoryMap.has(normSlug)) {
          const formattedName = normSlug
            .split(/[-_]+/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          categoryMap.set(normSlug, {
            id: `prod-cat-${normSlug}`,
            name: formattedName,
            slug: normSlug,
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
