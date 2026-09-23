# SECURITY_AUDIT — Skrtlife (launch-grade review)

> Findings traced to files read this session. Ratings: P0 Critical / P1 High / P2 Medium / P3 Low.

## P1-1 — Admin routes not centrally guarded in the router
- **Evidence:** `src/App.jsx` renders `/AdminModeration`, `/AdminWearables`, `/AdminOrders`, `/AdminMarketplace` etc. as plain `<Route>` elements with no `ProtectedRoute`/role wrapper. `ProtectedRoute.jsx` exists but is not used in `App.jsx`.
- **Mitigations present:** backend RLS enforces admin-only writes on admin entities (VERIFIED: Product/Wearable/Order/AuditLog/StripeWebhookEvent create/update/delete = `user_condition.role==='admin'`); admin pages also do in-page `user.role==='admin'` checks (per decisions).
- **Risk:** an unauthenticated user can *load* an admin page shell (cosmetic data exposure via read of public-read entities). Server-side data is protected. Still, route-level guard should be centralized.
- **Fix:** wrap admin `<Route>`s in a `<AdminRoute>` that checks `user.role==='admin'` and redirects otherwise. Defense-in-depth on top of RLS.

## P1-2 — `INTERNAL_FUNCTION_SECRET` not configured (fail-closed entitlements)
- **Evidence:** `grantEntitlementsForOrder` returns 403 if `body.internalSecret !== Deno.env.get('INTERNAL_FUNCTION_SECRET')` (VERIFIED). Existing secrets list has only STRIPE + STREAMOJI — no `INTERNAL_FUNCTION_SECRET`.
- **Impact:** paid Orders succeed but digital `AssetOwnership` grants are currently blocked → customers pay but receive no wardrobe entitlement until the secret is set. This is a known issue (snapshot: "Production config requires INTERNAL_FUNCTION_SECRET… to lift fail-closed security status").
- **Fix (ops):** set `INTERNAL_FUNCTION_SECRET` in app secrets. Not a code change.

## P1-3 — Stripe secret reported expired
- **Evidence:** known issue: "Stripe test secret key is expired (requires configuration to enable checkout functions)."
- **Impact:** `createCheckout`/webhook non-functional until a valid `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are set.
- **Fix (ops):** rotate Stripe keys.

## P2-1 — Ownership key migration debt (`user_email` vs `user_id`)
- **Evidence:** `Order` RLS read = `data.user_email === {{user.email}}` OR admin (VERIFIED); `Profile` keyed by `user_email`; `Transaction` by `user_email`. `AssetOwnership`/`PlayerProfile`/`WorldState`/`MissionProgress` correctly keyed by `user_id`.
- **Impact:** email change breaks ownership reads for the legacy entities. Not an exploit, but data integrity risk.
- **Fix:** migrate `Order/Profile/Transaction` ownership to `user_id` with an email→id backfill.

## P2-2 — Client-side cart in localStorage
- **Evidence:** `Layout.jsx` reads `localStorage.getItem('cart')` (VERIFIED). Price shown client-side is re-validated server-side in `createCheckout` (VERIFIED) — so cart tampering only affects display, not charge. Acceptable.
- **Fix:** none required (server re-validates). Optionally sign cart or move to server cart.

## P2-3 — Refunds do not revoke digital ownership
- **Evidence:** `stripeWebhook` audits `charge.refunded`/disputes but explicitly does NOT revoke `AssetOwnership` (VERIFIED comment: "Phase E policy deferred"). Intentional business decision, documented. Flag for product policy.

## P3-1 — `social_connections` stores OAuth tokens on User
- **Evidence:** `User.social_connections.<platform>.{access_token, refresh_token, expires_at}` (VERIFIED schema). Storing raw tokens on a user record is a credential-storage smell; RLS restricts to owner/admin but the User record is broadly readable by the owner.
- **Fix:** move tokens to a server-only table (admin-only read) referenced by user_id.

## Verified-secure patterns (good)
- `createCheckout` ignores client price/email/variant metadata; all authoritative from server `Product.get` (VERIFIED).
- `stripeWebhook` verifies HMAC signature + double idempotency (StripeWebhookEvent + Order.checkout_session_id) (VERIFIED).
- `grantEntitlementsForOrder` internal-secret gated, ownership idempotent on `(user_id, wearable_id, source_order_id)` (VERIFIED).
- Membership flags `genesis_holder`/`dripsync_plus_holder` set ONLY by the verified webhook (VERIFIED, schema comments confirm "never set from the client").
- `saveAvatarProfile` rejects equipped `wearable_id`s the user doesn't own (403 `unauthorized_wearable_ids`) (VERIFIED via avatarPersistence caller).
- Try-on wearables (`fromShop/isPreview/isDemo`) filtered out of canonical `avatar_config` persistence (VERIFIED).
- No client path grants ownership, membership, or admin role.

## Not yet verified (audit gaps)
- XSS surface in rich-text (react-quill) / markdown (react-markdown) user content — not traced this session.
- Upload validation (file type/size) on `Asset`/avatar uploads — not traced; `UploadPublicFile` is world-readable, confirm no PII routed there.
- Rate limiting: `rateLimiter` function exists but call-site wiring not verified.
- Webhook replay beyond Stripe idempotency — covered by event.id guard.