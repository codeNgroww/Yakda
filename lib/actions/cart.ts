'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/types/database';

export async function fetchCartFromDb(userId: string): Promise<CartItem[]> {
  const supabase = await createClient();
  if (!userId) return [];

  const { data: cartRow } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!cartRow) return [];

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products (
        id,
        title,
        sku,
        price,
        image
      )
    `)
    .eq('cart_id', cartRow.id);

  if (error || !items) return [];

  return items.map((item: any) => ({
    id: item.products?.id || item.product_id,
    sku: item.products?.sku || 'SKU',
    title: item.products?.title || 'Stationery Product',
    price: Number(item.products?.price || 0),
    quantity: item.quantity,
    image: item.products?.image || '/images/hero-desk.png',
  }));
}

export async function syncCartItemToDb(userId: string, productId: string, quantity: number) {
  const supabase = await createClient();
  if (!userId) return;

  // 1. Ensure user cart header exists
  let { data: cartRow } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!cartRow) {
    const { data: newCart } = await supabase
      .from('cart')
      .insert({ user_id: userId })
      .select('id')
      .single();
    cartRow = newCart;
  }

  if (!cartRow) return;

  // 2. Insert or update item in cart_items
  if (quantity <= 0) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartRow.id)
      .eq('product_id', productId);
  } else {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id')
      .eq('cart_id', cartRow.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cartRow.id,
        user_id: userId,
        product_id: productId,
        quantity,
      });
    }
  }
}

export async function clearCartInDb(userId: string) {
  const supabase = await createClient();
  if (!userId) return;

  const { data: cartRow } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (cartRow) {
    await supabase.from('cart_items').delete().eq('cart_id', cartRow.id);
  }
}
