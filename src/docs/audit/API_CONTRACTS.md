# API_CONTRACTS — Backend functions + SDK surfaces

## A. Backend functions (`base44/functions/*/entry.ts`, Deno runtime)

> 4 read in full this session (createCheckout, stripeWebhook, grantEntitlementsForOrder, + entitlementService shared). Others documented from name + usage; verify each `entry.ts` before migration.

### 1. `createCheckout`
- **Input:** `{ items:[{product_id, variant_sku, quantity}], shippingAddress, shippingMethod, successUrl, cancelUrl }`
- **Auth:** `base44.auth.me()` REQUIRED (email/userId derived from session; client email ignored).
- **Logic:** server-side product+variant fetch, authoritative pricing, inventory check, Stripe Checkout session. Metadata: `{ user_id, user_email, product_id, variant_sku, ... }`.
- **Output:** `{ url }` (Stripe Checkout URL).
- **Errors:** 401 no auth, 400 bad cart/qty/variant/stock, 500.
- **Callers:** Cart/Checkout page (via `base44.functions.invoke`).

### 2. `stripeWebhook`
- **Input:** raw Stripe body + `stripe-signature` header.
- **Auth:** Stripe signature (HMAC) via `STRIPE_WEBHOOK_SECRET`. No user auth.
- **Logic:** verify → idempotency (StripeWebhookEvent by event.id + Order by checkout_session_id) → create Order → decrement inventory → set `genesis_holder`/`dripsync_plus_holder` for membership products → invoke `grantEntitlementsForOrder` (internal secret) → send email.
- **Output:** `{ received: true }`.
- **Idempotency:** double-guarded. Refunds/disputes audited only (no auto-revoke).
- **URL:** `https://<app>.base44.app/functions/stripeWebhook` (register in Stripe dashboard).

### 3. `grantEntitlementsForOrder` (internal-only)
- **Input:** `{ orderId, stripeEventId, stripeSessionId, internalSecret }`
- **Auth:** `INTERNAL_FUNCTION_SECRET` (fail-closed 403 without it).
- **Logic:** load trusted Order → for each line item resolve `wearable_id` from Product/variant → check ownership idempotency `(user_id, wearable_id, source_order_id)` → create `AssetOwnership` (source:'purchase').
- **Output:** `{ success, orderId, summary:{granted, already_owned, no_digital_entitlement, failed} }`.
- **Callers:** `stripeWebhook` only.

### 4. `saveAvatarProfile`
- **Input:** `{ avatar_config }`
- **Auth:** `auth.me()` REQUIRED.
- **Logic:** validates equipped `wearable_id`s against the caller's `AssetOwnership`; rejects unauthorized with `{ unauthorized_wearable_ids }` (403); persists to `User.avatar_config`.
- **Output:** `{ success, avatar_config }` | 403 unauthorized | 401.
- **Callers:** `avatarPersistence.js → persistAvatarProfile` (the single secure frontend save path). VERIFIED.

### 5. `membershipCheckout` / 6. `genesisCheckout`
- Membership/Genesis Stripe sessions. `membershipPlans.js` prices: DripSync+ $2.99/mo, Genesis $299 lifetime. Webhook sets the canonical flags. (Verify entry.ts before migration.)

### 7. `grantGenesisPass` — internal-secret; creates GenesisPass record + sets `genesis_holder`.
### 8. `mintGenesisPass` — NFT mint path (verify).
### 9. `verifyGenesisPass` — Genesis access check.
### 10. `saveDefaultAvatar` — saves a default/starter avatar (DripSyncAsset).
### 11. `sendOrderConfirmation` — internal-secret; emails order receipt via `Core.SendEmail`.
### 12. `adminRefundOrder` / 13. `adminUpdateOrder` — admin order ops (RLS admin).
### 14. `createEventCheckout` / 15. `eventWebhook` — events (currently disabled per pages.config notes; backend-locked).
### 16. `streamojiAuth` — Streamoji OAuth (uses `STREAMOJI_CLIENT_SECRET/ID`).
### 17. `uploadToIPFS` — IPFS pinning (verify).
### 18. `rateLimiter` — rate limiting util.
### 19. `colyseusRoom` — multiplayer room (presence stub, not wired).
### 20. `sendReportToChatGPT` — error reporting (verify).

## B. SDK entity surface (client)
`base44.entities.<Name>.{list, filter, get, create, update, delete, bulkCreate, bulkUpdate, updateMany, deleteMany, schema, subscribe}` — used across all data pages. `base44.asServiceRole.entities.*` in server functions (bypasses RLS).

## C. Integration surface (client + server)
`base44.integrations.Core.{InvokeLLM, SendEmail, UploadPublicFile, UploadPrivateFile, CreateFileSignedUrl, ExtractDataFromUploadedFile, GenerateImage, GenerateSpeech, GenerateVideo, TranscribeAudio}`. `InvokeLLM` supports `model`, `response_json_schema`, `add_context_from_internet` (gemini only), `file_urls`.

## D. Auth surface
`base44.auth.{me, logout, redirectToLogin, updateMe, isAuthenticated}`. `base44.users.inviteUser(email, role)`.

## E. Contract for the independent backend
Each function above becomes a route on your API gateway. Preserve: server-authoritative pricing, Stripe-signature verification, internal-secret gating of `grantEntitlementsForOrder`/`grantGenesisPass`/`sendOrderConfirmation`, ownership idempotency key `(user_id, wearable_id, source_order_id)`, and the `saveAvatarProfile` ownership validation. The Deno→Node port is mechanical; the business logic is the asset to keep intact.