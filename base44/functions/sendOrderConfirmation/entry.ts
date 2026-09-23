import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── Authorization: admin/superadmin OR valid internal secret ──────────
    let callerIsAuthorized = false;
    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    if (internalSecret && body.internalSecret === internalSecret) {
      callerIsAuthorized = true;
    } else {
      try {
        const user = await base44.auth.me();
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
          callerIsAuthorized = true;
        }
      } catch {
        // unauthenticated — not authorized
      }
    }

    if (!callerIsAuthorized) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { orderId } = body;

    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await base44.asServiceRole.entities.Order.get(orderId);

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Recipient is derived server-side from the order record. Client-supplied
    // recipient addresses are ignored to prevent PII leakage to arbitrary emails.
    const customerEmail = order.user_email;
    if (!customerEmail) {
      return Response.json({ error: 'Order has no customer email on file' }, { status: 400 });
    }

    const itemsList = order.line_items.map(item => 
      `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
        ${item.title} ${item.variant_sku ? `(${item.variant_sku})` : ''} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
      </li>`
    ).join('');

    const shippingInfo = order.shipping_address ? `
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <h3 style="margin-top: 0;">Shipping To:</h3>
        <p style="margin: 5px 0;">
          ${order.shipping_address.first_name} ${order.shipping_address.last_name}<br/>
          ${order.shipping_address.street_address}${order.shipping_address.apartment ? ', ' + order.shipping_address.apartment : ''}<br/>
          ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip_code}<br/>
          ${order.shipping_address.country || 'US'}
        </p>
      </div>
    ` : '';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Order Confirmation - SKRTLIFE #${orderId.slice(-8)}`,
      body: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0;">SKRTLIFE</h1>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #FF3366; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #00D4FF; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #FFD700; display: inline-block;"></span>
            </div>
          </div>

          <h2 style="color: #000; font-size: 24px; margin-bottom: 8px;">Thanks for your order!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We've received your order and it's being processed. You'll receive a shipping notification when it's on the way.
          </p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <h3 style="margin-top: 0; font-size: 18px;">Order #${orderId.slice(-8)}</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${itemsList}
            </ul>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #ddd;">
              <p style="font-size: 20px; font-weight: bold; margin: 0;">Total: $${order.total_amount.toFixed(2)}</p>
            </div>
          </div>

          ${shippingInfo}

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Reply to this email or contact support@skrtlife.com
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} SKRTLIFE. All rights reserved.</p>
          </div>
        </div>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to send confirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}));