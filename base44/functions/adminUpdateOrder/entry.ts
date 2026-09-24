import { validateOrderUpdate } from '../../shared/orderUpdateContract.js';
import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // ADMIN ONLY: Enforce admin role
    if (!user || user.role !== 'admin') {
      console.error(`Unauthorized access attempt by ${user?.email || 'unknown'}`);
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, updates } = await req.json();

    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let patch;
    try { patch = validateOrderUpdate(orderId, updates); } catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
    const current = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
    if (!current) return Response.json({error:'Order not found'}, {status:404});
    // Update the order
    const updatedOrder = await base44.asServiceRole.entities.Order.update(orderId, {
      ...patch,
      events: [
        ...(current.events || []),
        {
          timestamp: new Date().toISOString(),
          message: `Order updated by admin ${user.email}: ${updates.updateNote || 'status changed'}`
        }
      ]
    });

    // Log the action
    await base44.asServiceRole.entities.AuditLog.create({
      actor_email: user.email,
      actor_role: user.role,
      action: 'update',
      entity_type: 'Order',
      entity_id: orderId,
      after_state: updatedOrder,
      status: 'success',
      metadata: {
        update_type: updates.fulfillment_status ? 'fulfillment' : 'general',
        changes: updates
      }
    });

    return Response.json({ success: true, order: updatedOrder });

  } catch (error) {
    // Preserve provider auth status for the shared, redacted error contract.
    throw error;
  }
}));
