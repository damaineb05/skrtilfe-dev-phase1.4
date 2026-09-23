# SKRTLIFE — Release Blockers (external / config)

Maintained for the final launch audit. These require human / platform action,
not code changes. Do NOT bypass them to make testing easier.

## 1. STRIPE_SECRET_KEY runtime propagation
- The secret is present in the app secrets store but is not reliably
  propagated to the checkout backend functions at runtime in the current
  environment.
- Effect: `createCheckout` / `membershipCheckout` / `genesisCheckout` cannot
  create live Stripe Checkout Sessions until the key is active server-side.
- Action: rotate/confirm STRIPE_SECRET_KEY in platform secrets; verify a test
  checkout session can be created from a deployed function.

## 2. INTERNAL_FUNCTION_SECRET
- Internal/sensitive backend functions fail-closed when this env var is unset.
- Effect: admin / entitlement-granting functions may reject legitimate calls.
- Action: configure INTERNAL_FUNCTION_SECRET in the deployment environment.

## 3. Stripe webhook configuration
- The `stripeWebhook` endpoint must be registered in the Stripe dashboard with
  the signing secret (STRIPE_WEBHOOK_SECRET) and pointed at:
  https://skrtlife-digital-society-copy-da222a27.base44.app/functions/stripeWebhook
- Effect: without it, paid orders do not grant entitlements / ownership.
- Action: add the webhook in Stripe; verify `checkout.session.completed` reaches
  the function and creates an Order + AssetOwnership + AuditLog.

## 4. First legitimate Product → Wearable digital asset mapping
- No Product is yet linked to a Wearable entity (Product.wearable_id / variant
  wearable_id) with a real `.glb` model_url.
- Effect: purchases cannot grant a digital twin (AssetOwnership). The wardrobe
  empty state is correct, but ownership generation is unproven end-to-end.
- Action: create the first Wearable (model_url, category, rarity), link it to a
  Product / variant, and verify a paid order grants ownership that appears in
  MyAccount → Identity → Digital Wardrobe.

## 5. Default Ready Player Me GLB verification (requires real browser)
- The four default avatar GLBs in `src/lib/defaultAvatars.js` could not be
  fetched from the build sandbox (external network is blocked here).
- IDs already in active runtime code paths (most trusted):
  - `6460d95f9ae10f45bffb2864` (Nova)  — used as the picker fallback
  - `65e24e8c1f91b9bf7af7e882` (Cipher) — used in demo wearables
- IDs only present in the picker registry (unverified):
  - `64b1c6f33571bf9e1a4f8e1d` (Zara)
  - `64bfa7d1e0f1d14f93b1e5e2` (Kade)
- Action: open `/DripSync` as a new user in a real browser and confirm all four
  defaults load, are visually distinct, save through canonical avatar_config,
  and enter World. Replace any 404 with a known-valid RPM avatar ID — do NOT
  fabricate URLs.