import { contractHandler } from '../../shared/apiContract.js';
import { requireServerConfiguration, configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // ADMIN ONLY: Enforce admin role
    if (!user || user.role !== 'admin') {
      console.error(`Unauthorized refund attempt by ${user?.email || 'unknown'}`);
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, reason } = await req.json();

    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get the order
    const order = await base44.asServiceRole.entities.Order.get(orderId);
    
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'refunded') {
      return Response.json({ error: 'Order already refunded' }, { status: 400 });
    }

    if (!order.transaction_id) {
      return Response.json({ error: 'No payment intent found for this order' }, { status: 400 });
    }

    // Process Stripe refund
    const stripe = new Stripe(requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_SECRET_KEY'));
    const refund = await stripe.refunds.create({
      payment_intent: order.transaction_id,
      reason: 'requested_by_customer',
      metadata: {
        order_id: orderId,
        refunded_by: user.email,
        reason: reason || 'Admin refund'
      }
    });

    // Update order status
    const updatedOrder = await base44.asServiceRole.entities.Order.update(orderId, {
      payment_status: 'refunded',
      events: [
        ...(order.events || []),
        {
          timestamp: new Date().toISOString(),
          message: `Refund processed by ${user.email}. Reason: ${reason || 'Not specified'}`
        }
      ]
    });

    // Log the action
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_role: user.role,
      action: 'refund',
      entity_type: 'Order',
      entity_id: orderId,
      before_state: { payment_status: order.payment_status },
      after_state: { payment_status: 'refunded' },
      status: 'success',
      metadata: {
        refund_id: refund.id,
        amount: refund.amount,
        reason: reason
      }
    });

    // Notify customer
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.user_email,
        subject: 'Refund Processed - SKRTLIFE',
        body: `
          <h1>Your refund has been processed</h1>
          <p>Order ID: ${orderId}</p>
          <p>Refund Amount: $${(refund.amount / 100).toFixed(2)}</p>
          <p>The refund will appear in your account within 5-10 business days.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p>If you have any questions, please contact support.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
    }

    return Response.json({ 
      success: true, 
      order: updatedOrder,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('Admin refund failed:', error);
    
    // Log failed attempt
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      
      await base44.asServiceRole.entities.AuditLog.create({
        actor_email: user.email,
        actor_role: user.role,
        action: 'refund',
        entity_type: 'Order',
        status: 'failed',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return Response.json({
      error: 'Failed to process refund',
      details: error.message
    }, { status: 500 });
  }
}));