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
