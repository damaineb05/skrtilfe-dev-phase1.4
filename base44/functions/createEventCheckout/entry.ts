import { contractHandler } from '../../shared/apiContract.js';
import { configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createSafeCheckoutSession } from '../../shared/checkoutSafety.js';
import { resolveDeployment } from '../../shared/deploymentPolicy.js';
import { activeGenesisQuery } from '../../shared/genesisContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.14.0';

/** Admin access is an explicit role policy; paid Genesis access requires its canonical record. */
async function userHasGenesisAccess(base44, user) {
  if (user.role === 'admin') return true;
  const passes = await base44.asServiceRole.entities.GenesisPass.filter(activeGenesisQuery(user.id));
  return passes.length > 0;
}

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, success_url, cancel_url } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get event details
    const event = await base44.asServiceRole.entities.Event.get(event_id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check capacity
    if (event.capacity && event.tickets_sold >= event.capacity) {
      return Response.json({ error: 'Event is sold out' }, { status: 400 });
    }

    // Check if user already has a ticket
    const existingTickets = await base44.asServiceRole.entities.Ticket.filter({
      event_id: event_id,
      user_email: user.email,
      status: 'valid'
    });

    if (existingTickets.length > 0) {
      return Response.json({ error: 'You already have a ticket for this event' }, { status: 400 });
    }

    // Check Genesis requirement
    if (event.requires_genesis) {
      const hasAccess = await userHasGenesisAccess(base44, user);
      if (!hasAccess) {
        console.warn(`🚫 Genesis gate denied for user ${user.email} on event ${event_id}`);
        return Response.json(
          { error: 'This event is exclusive to Genesis Pass holders. Upgrade your membership to access it.' },
          { status: 403 }
        );
      }
    }

    const totalPrice = event.price + (event.service_fee || 0);

    // Create line items
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: event.title,
          description: `${event.subtitle || ''} - ${event.date}`,
          images: event.image_url ? [event.image_url] : [],
        },
        unit_amount: Math.round(totalPrice * 100),
      },
      quantity: 1,
    }];

    // Create Stripe checkout session
    const deployment = resolveDeployment(Deno.env.get('BASE44_APP_ID'));
    const session = await createSafeCheckoutSession(Stripe, name => Deno.env.get(name), {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${deployment.applicationOrigin}/Events?success=true`,
      cancel_url: cancel_url || `${deployment.applicationOrigin}/Events?cancelled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        event_id: event_id,
        user_email: user.email,
        event_title: event.title,
      },
    }, { apiVersion: '2023-10-16' });

    console.log('✅ Checkout session created:', session.id);

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('❌ Event checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}));