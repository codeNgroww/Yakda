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

  // Format Whatsapp Message
  const waMessage = `*New Order Placed - Yakda*\n` +
    `Order ID: ${orderId}\n` +
    `---------------------------\n` +
    `Customer: ${customerEmail}\n` +
    `Phone: ${contactPhone}\n` +
    `Address: ${deliveryAddress}\n\n` +
    `*Items Summary:*\n${itemsSummary}\n\n` +
    `*Total Amount:* AED ${totalAmount.toFixed(2)}\n` +
    `Thank you for ordering with Yakda!`;

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

    // ---------------------------------------------------------
    // 2. Send WhatsApp (using Twilio API as standard approach)
    // ---------------------------------------------------------
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. whatsapp:+14155238886

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Basic Twilio Basic Auth
      const twilioAuth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      
      // Ensure phone number starts with 'whatsapp:' and country code (e.g., whatsapp:+971501234567)
      const formattedPhone = contactPhone.startsWith('+') ? `whatsapp:${contactPhone}` : `whatsapp:+${contactPhone}`;

      const twilioData = new URLSearchParams({
        From: twilioPhoneNumber,
        To: formattedPhone,
        Body: waMessage,
      });

      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: twilioData.toString(),
      });
    } else {
      console.warn('Twilio keys are not set. Skipping automated WhatsApp message.');
    }

    return { success: true, message: 'Notifications processed on the backend.' };

  } catch (error: any) {
    console.error('Error sending order notifications:', error);
    return { success: false, error: error.message };
  }
}
