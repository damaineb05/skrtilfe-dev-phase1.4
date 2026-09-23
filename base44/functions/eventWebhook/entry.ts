import { requireServerConfiguration, configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.14.0';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('❌ Missing webhook signature');
    return Response.json({ error: 'Webhook validation failed' }, { status: 400 });
  }

  let event;
  try {
    const stripe = new Stripe(requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });
    const webhookSecret = requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_WEBHOOK_SECRET');
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const configurationFailure = configurationErrorResponse(err);
    if (configurationFailure) return configurationFailure;
    console.error('❌ Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Initialize SDK after webhook validation
  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('✅ Checkout completed:', session.id);

      const { event_id, user_email, event_title } = session.metadata;

      if (!event_id || !user_email) {
        console.error('❌ Missing metadata in session');
        return Response.json({ error: 'Invalid session metadata' }, { status: 400 });
      }

      // Get event details
      const eventData = await base44.asServiceRole.entities.Event.get(event_id);
      if (!eventData) {
        console.error('❌ Event not found:', event_id);
        return Response.json({ error: 'Event not found' }, { status: 404 });
      }

      // Generate unique ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create ticket
      const ticket = await base44.asServiceRole.entities.Ticket.create({
        event_id: event_id,
        user_email: user_email,
        order_id: session.id,
        ticket_number: ticketNumber,
        status: 'valid',
        price_paid: session.amount_total / 100,
        qr_code: ticketNumber, // In production, generate proper QR code
        metadata: {
          event_title: event_title || eventData.title,
          session_id: session.id,
        }
      });

      console.log('✅ Ticket created:', ticket.id);

      // Update event tickets_sold count
      await base44.asServiceRole.entities.Event.update(event_id, {
        tickets_sold: (eventData.tickets_sold || 0) + 1
      });

      console.log('✅ Event tickets_sold updated');

      // Send confirmation email
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user_email,
          subject: `Your Ticket for ${event_title || eventData.title}`,
          body: `
            <h2>Thank you for your purchase!</h2>
            <p>Your ticket for <strong>${event_title || eventData.title}</strong> has been confirmed.</p>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p><strong>Date:</strong> ${eventData.date}</p>
            <p><strong>Location:</strong> ${eventData.location}</p>
            <p>You can view your ticket in your Portfolio.</p>
          `
        });
        console.log('✅ Confirmation email sent');
      } catch (emailError) {
        console.error('⚠️ Email failed:', emailError.message);
      }

      return Response.json({ received: true, ticket_id: ticket.id });
    }

    return Response.json({ received: true });

  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('❌ Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});