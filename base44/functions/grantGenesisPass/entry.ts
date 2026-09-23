/**
 * grantGenesisPass — Creates a GenesisPass record for a user.
 *
 * Authorization: admin/superadmin OR a valid INTERNAL_FUNCTION_SECRET
 * (used by internal callers such as the Stripe webhook after a completed
 * Genesis checkout). The previous authenticated-user self-grant branch
 * has been removed — non-admins can no longer grant themselves a pass.
 *
 * Target identity (userId/userEmail) is only consumed AFTER the caller is
 * authorized. If only an email is provided, the userId is resolved by
 * looking up the user record.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── Authorization: admin/superadmin OR valid internal secret ──────────
    let callerIsAuthorized = false;
    let invokingUser = null;

    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    if (internalSecret && body.internalSecret === internalSecret) {
      callerIsAuthorized = true;
    } else {
      try {
        invokingUser = await base44.auth.me();
        if (invokingUser && (invokingUser.role === 'admin' || invokingUser.role === 'superadmin')) {
          callerIsAuthorized = true;
        }
      } catch {
        // unauthenticated — not authorized
      }
    }

    if (!callerIsAuthorized) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // ── Resolve target identity (only after authorization) ───────────────
    let targetUserId = body.userId || null;
    let targetUserEmail = body.userEmail || null;

    // If only an email was provided (e.g. webhook), resolve the userId
    if (!targetUserId && targetUserEmail) {
      const users = await base44.asServiceRole.entities.User.filter({ email: targetUserEmail });
      if (users && users.length > 0) {
        targetUserId = users[0].id;
      }
    }

    // If an admin invokes without an explicit target, grant to self
    if (!targetUserId && invokingUser) {
      targetUserId = invokingUser.id;
      targetUserEmail = invokingUser.email;
    }

    if (!targetUserId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user already has an active pass
    const existing = await base44.asServiceRole.entities.GenesisPass.filter({
      user_id: targetUserId,
      is_active: true,
    });

    if (existing?.length > 0) {
      return Response.json({ success: true, alreadyHeld: true, pass: existing[0] });
    }

    // Count existing passes to assign pass_number
    const allPasses = await base44.asServiceRole.entities.GenesisPass.filter({});
    const passNumber = (allPasses?.length || 0) + 1;

    // Create the GenesisPass record
    const pass = await base44.asServiceRole.entities.GenesisPass.create({
      user_id: targetUserId,
      tier: 'genesis_888',
      pass_number: passNumber,
      is_active: true,
      mint_date: new Date().toISOString(),
      perks: {
        exclusive_drops: true,
        discount_percentage: 20,
        avatar_slots: 5,
        creator_access: true,
        physical_hoodie: true,
        early_access: true,
      },
    });

    // Also update user record with genesis_holder flag for fast checks
    try {
      if (!targetUserEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ id: targetUserId });
        if (users?.[0]) targetUserEmail = users[0].email;
      }
      if (targetUserEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ email: targetUserEmail });
        if (users?.[0]) {
          await base44.asServiceRole.entities.User.update(users[0].id, { genesis_holder: true });
        }
      }
    } catch {
      // Non-fatal — pass record is the source of truth
    }

    return Response.json({ success: true, pass, passNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});