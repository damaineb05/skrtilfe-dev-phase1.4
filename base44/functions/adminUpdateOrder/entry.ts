import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
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

    // Update the order
    const updatedOrder = await base44.asServiceRole.entities.Order.update(orderId, {
      ...updates,
      events: [
        ...(updates.existingEvents || []),
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
    console.error('Admin order update failed:', error);
    return Response.json({
      error: 'Failed to update order',
      details: error.message
    }, { status: 500 });
  }
});