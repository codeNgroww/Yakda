'use server';

import { createClient } from '@/lib/supabase/server';
import { Blog } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function fetchBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
  return data || [];
}

export async function fetchPublishedBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published blogs:', error);
    return [];
  }
  return data || [];
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
  return data;
}

export async function createBlog(blogData: Partial<Blog>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .insert([blogData])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw new Error(error.message);
  }

  revalidatePath('/blog');
  revalidatePath('/admin');
  return data;
}

export async function updateBlog(id: string, blogData: Partial<Blog>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .update(blogData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog:', error);
    throw new Error(error.message);
  }

  revalidatePath('/blog');
  revalidatePath('/admin');
  return data;
}

export async function deleteBlog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog:', error);
    throw new Error(error.message);
  }

  revalidatePath('/blog');
  revalidatePath('/admin');
}
