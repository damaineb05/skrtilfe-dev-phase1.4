import { contractHandler } from '../../shared/apiContract.js';
import { configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createSafeCheckoutSession } from '../../shared/checkoutSafety.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Require an authenticated session ───────────────────────────────
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, shippingMethod, successUrl, cancelUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Email is derived exclusively from the authenticated session.
    // Client-supplied email is ignored.
    const email = user.email;
    const userId = user.id;
    if (!email) {
      return Response.json({ error: 'Authenticated account has no email on file' }, { status: 400 });
    }

    // ── Resolve each line item against the authoritative Product record ──
    // The client can no longer dictate pricing or descriptive fields —
    // these are all loaded server-side and validated.
    const lineItems = [];
    const fulfillmentMap = {};

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || typeof item !== 'object' || typeof item.product_id !== 'string' || !/^[\w-]{1,128}$/.test(item.product_id)) return Response.json({error: 'Invalid cart item'}, {status:400});

      // Validate quantity: integer from 1–20
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        return Response.json(
          { error: `Invalid quantity for an item in your cart (must be 1–20).` },
          { status: 400 }
        );
      }

      const productId = item.product_id;
      if (!productId) {
        return Response.json({ error: 'A cart item is missing a product_id.' }, { status: 400 });
      }

      // Fetch the product server-side
      let product;
      try {
        product = await base44.entities.Product.get(productId);
      } catch {
        return Response.json({ error: `Product not found: ${productId}` }, { status: 400 });
      }
      if (!product) {
        return Response.json({ error: `Product not found: ${productId}` }, { status: 400 });
      }
      if (product.status !== 'active') {
        return Response.json({ error: `"${product.title}" is no longer available.` }, { status: 400 });
      }

      // Resolve the variant by SKU against the server-side variant list
      let variant = null;
      if (product.variants && product.variants.length > 0) {
        if (item.variant_sku) {
          variant = product.variants.find(v => v.sku === item.variant_sku) || null;
          if (!variant) {
            return Response.json(
              { error: `Variant not found for "${product.title}" (SKU: ${item.variant_sku}).` },
              { status: 400 }
            );
          }
        } else {
          return Response.json(
            { error: `"${product.title}" requires a selected variant.` },
            { status: 400 }
          );
        }
      }

      // Authoritative pricing: variant price (if set) overrides product base price
      let unitPrice = product.price;
      if (variant && typeof variant.price === 'number') {
        unitPrice = variant.price;
      }
      if (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice) || unitPrice < 0) {
        return Response.json({ error: `"${product.title}" has no valid price.` }, { status: 400 });
      }

      // Authoritative descriptive fields (from server, not the browser)
      const title = product.title;
      const size = variant ? variant.size : (item.size || '');
      const color = variant ? variant.color : (item.color || '');
      const variantSku = variant ? variant.sku : (item.variant_sku || '');
      const productType = product.product_type || 'physical';

      // Inventory check before creating the Stripe session
      const availableQty = variant ? variant.inventory_qty : product.inventory_qty;
      if (typeof availableQty === 'number' && availableQty < qty) {
        const label = availableQty > 0
          ? `Only ${availableQty} of "${title}" left in stock.`
          : `"${title}" is out of stock.`;
        return Response.json({ error: label }, { status: 400 });
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: title,
          },
          // Metadata on price_data is accessible as item.price.metadata in webhook listLineItems
          metadata: {
            product_id: productId,
            variant_sku: variantSku,
            color,
            size,
            product_type: productType,
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: qty,
      });

      fulfillmentMap[`item_${i}_pid`] = productId;
      fulfillmentMap[`item_${i}_sku`] = variantSku;
    }

    // Prepare shipping options
    const shippingOptions = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 1500, currency: 'usd' },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 }
          }
        }
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 2500, currency: 'usd' },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 3 }
          }
        }
      }
    ];

    // Create Stripe checkout session
    const session = await createSafeCheckoutSession(Stripe, name => Deno.env.get(name), {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'KR', 'NL', 'SE', 'NO', 'DK', 'CH', 'AT', 'BE', 'PT', 'IE', 'NZ', 'SG', 'HK', 'MX', 'BR']
      },
      shipping_options: shippingOptions,
      phone_number_collection: {
        enabled: true
      },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: userId,
        user_email: email,
        shipping_method: shippingMethod || 'standard',
        ...fulfillmentMap,
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('createCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}));