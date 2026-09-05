'use server';

import { CartItem } from '@/types/database';

interface NotificationParams {
  orderId: string;
  customerEmail: string;
  contactPhone: string;
  deliveryAddress: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export async function sendOrderNotifications(params: NotificationParams) {
  const { orderId, customerEmail, contactPhone, deliveryAddress, cartItems, totalAmount } = params;

  // Format Items for plain text
  const itemsSummary = cartItems
    .map((i) => `• ${i.title} (x${i.quantity}) - AED ${(i.price * i.quantity).toFixed(2)}`)
    .join('\n');


  const emailSubject = `New Order Placed - Yakda (${orderId})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1A2A4E; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #D93630;">New Order Confirmation</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer Email:</strong> ${customerEmail}</p>
      <p><strong>Phone Number:</strong> ${contactPhone}</p>
      <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary:</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        ${cartItems.map(i => `<li style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${i.title} <strong style="color: #666;">(x${i.quantity})</strong> - <span style="font-weight: bold; color: #1A2A4E;">AED ${(i.price * i.quantity).toFixed(2)}</span></li>`).join('')}
      </ul>
      
      <h3 style="margin-top: 20px;">Total Amount: <span style="color: #D93630;">AED ${totalAmount.toFixed(2)}</span></h3>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">Thank you for ordering with Yakda. Our team will contact you shortly regarding delivery.</p>
    </div>
  `;

  try {
    // ---------------------------------------------------------
    // 1. Send Email (using Resend as standard Next.js approach)
    // ---------------------------------------------------------
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Yakda Orders <orders@yakda.ae>', // Replace with verified domain
          to: [customerEmail, 'inquiry@alyakda.com'], // Send to customer & store admin
          subject: emailSubject,
          html: emailHtml,
        }),
      });
    } else {
      console.warn('RESEND_API_KEY is not set. Skipping automated email.');
    }

    return { success: true, message: 'Email notification processed on the backend.' };

  } catch (error: any) {
    console.error('Error sending order notifications:', error);
    return { success: false, error: error.message };
  }
}
