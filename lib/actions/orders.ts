'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem, Order } from '@/types/database';

export async function createOrderInDb(params: {
  userId?: string;
  customerEmail: string;
  cartItems: CartItem[];
  totalAmount: number;
  contactPhone: string;
  deliveryAddress: string;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient();
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // 1. Save Header in orders table
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      user_id: params.userId || 'guest',
      customer_email: params.customerEmail,
      items: params.cartItems,
      total_amount: params.totalAmount,
      status: 'pending',
      contact_phone: params.contactPhone,
      delivery_address: params.deliveryAddress,
    });

    if (orderError) {
      console.warn('Order insert notice:', orderError.message);
    }

    // 2. Save Item Details in order_items table
    const orderItemsRows = params.cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.title,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsRows);
    if (itemsError) {
      console.warn('Order items insert notice:', itemsError.message);
    }

    return { success: true, orderId };
  } catch (err: any) {
    console.error('Error creating order:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchUserOrders(userId: string, userEmail?: string): Promise<Order[]> {
  const supabase = await createClient();
  if (!userId && !userEmail) return [];

  let query = supabase.from('orders').select('*');

  if (userId && userEmail) {
    query = query.or(`user_id.eq.${userId},customer_email.eq.${userEmail}`);
  } else if (userId) {
    query = query.eq('user_id', userId);
  } else if (userEmail) {
    query = query.eq('customer_email', userEmail);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching all orders for admin:', error);
    return [];
  }
  return data;
}

export async function updateOrderStatusInDb(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}
