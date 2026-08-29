'use server';

import { createClient } from '@/lib/supabase/server';

export async function fetchFavoritesFromDb(userId: string): Promise<string[]> {
  const supabase = await createClient();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((f: { product_id: string }) => f.product_id);
}

export async function toggleFavoriteInDb(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!userId || !productId) return false;

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false; // Removed from favorites
  } else {
    await supabase.from('favorites').insert({
      user_id: userId,
      product_id: productId,
    });
    return true; // Added to favorites
  }
}
