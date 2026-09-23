# MIGRATION_MANIFEST — Base44 → Independent

> Per-file classification: KEEP / MODIFY / REPLACE / DELETE / INVESTIGATE. Reason in one line. Only important files listed; trivial UI components inherit the "KEEP (swap data layer)" default.

## Build & infra
| File | Action | Reason |
|---|---|---|
| `vite.config.js` | MODIFY | remove `@base44/vite-plugin`, keep `@vitejs/plugin-react` |
| `package.json` | MODIFY | remove `@base44/sdk`, `@base44/vite-plugin`; add independent DB/auth/storage clients |
| `src/api/base44Client.js` | REPLACE | replace with `skrtClient.js` against your backend; keep same exported surface |
| `src/lib/app-params.js` | REPLACE | `appId/token/functionsVersion` are platform-injected; replace with env-driven config |
| `src/lib/AuthContext.jsx` | MODIFY | replace `base44.auth.*` + `/api/apps/public` with your auth provider; keep context shape |
| `.gitignore`, `eslint.config.js`, `jsconfig.json` | KEEP | |

## Data layer (call sites)
| Area | Action | Reason |
|---|---|---|
| Every `base44.entities.X.*` call site | MODIFY | route through `skrtClient.entities.X` (mechanical, find/replace-friendly) |
| Every `base44.integrations.Core.*` call | MODIFY | route through `skrtClient.integrations.*` (Resend/S3/LLM providers) |
| Every `base44.functions.invoke(...)` | MODIFY | point at your function gateway |
| `base44.entities.X.subscribe` | MODIFY | replace with your realtime channel |
| `base44.analytics.track` | MODIFY | replace with PostHog/Mixpanel |

## Backend functions (18) — KEEP logic, REPLACE runtime
| File | Action | Reason |
|---|---|---|
| `base44/functions/createCheckout/entry.ts` | MODIFY | Deno→Node; replace `createClientFromRequest`; keep Stripe logic (VERIFIED secure) |
| `base44/functions/stripeWebhook/entry.ts` | MODIFY | same; keep signature verify + idempotency |
| `base44/functions/grantEntitlementsForOrder/entry.ts` | MODIFY | same; keep internal-secret gate |
| `base44/shared/entitlementService.js` | MODIFY | swap `base44.asServiceRole` → your service client; KEEP the grant/idempotency logic intact |
| `base44/shared/avatarConfigServer.js` | MODIFY | swap client |
| `saveAvatarProfile`, `membershipCheckout`, `genesisCheckout`, `grantGenesisPass`, `mintGenesisPass`, `verifyGenesisPass`, `sendOrderConfirmation`, `adminRefundOrder`, `adminUpdateOrder`, `createEventCheckout`, `eventWebhook`, `streamojiAuth`, `uploadToIPFS`, `rateLimiter`, `colyseusRoom`, `sendReportToChatGPT`, `saveDefaultAvatar` | MODIFY | Deno→Node; swap `createClientFromRequest`; preserve auth/secret gates |

## Entities (DB) — REPLACE store, KEEP schemas
| Area | Action | Reason |
|---|---|---|
| All `base44/entities/*.jsonc` | MODIFY | translate schemas → your DB (Postgres tables or Mongo docs). Preserve fields, defaults, enums. |
| RLS policies | MODIFY | reimplement as Postgres RLS / policy layer / app-level authz (patterns are 1:1) |
| Realtime subscriptions | REPLACE | Mongo change streams / Supabase realtime / WS |

## Frontend — KEEP (portable)
| Area | Action | Reason |
|---|---|---|
| `src/App.jsx`, `src/pages.config.js`, `src/Layout.jsx` | KEEP | router/layout are portable |
| `src/pages/*` | KEEP | swap data layer only |
| `src/components/*` (ui, layout, dripsync, shop, product, checkout, account, home, genesis, identity, streaming) | KEEP | swap data layer only |
| `src/game/*` (Three.js World) | KEEP | only `GameStateAdapter`/`SaveManager` touch Base44 — swap there |
| `src/dripsync/*` (framework-agnostic runtime) | KEEP | `DripSyncRepository` is the Base44 touch point — swap it |
| `src/lib/avatarPersistence.js`, `avatarConfig.js`, `membershipPlans.js`, `membershipAccess.js` | MODIFY | `persistAvatarProfile` calls `base44.functions.invoke('saveAvatarProfile')` → point at your gateway |
| `src/lib/guestAvatarMigration.js`, `defaultAvatars.js`, `rpmHelpers.jsx` | KEEP | no platform dependency |

## Investigate / clean up
| Item | Action | Reason |
|---|---|---|
| `src/pages/Wallet.jsx` | INVESTIGATE | backend-locked shell (simulated); disabled in routing |
| `src/pages/Events.jsx` | INVESTIGATE | backend-locked shell; `createEventCheckout` required |
| `src/components/auth/ProtectedRoute.jsx` vs `src/components/ProtectedRoute.jsx` | INVESTIGATE | two ProtectedRoute files — confirm which is canonical; consolidate |
| `Avatar` entity vs `User.avatar_config` vs `DripSyncAsset` | INVESTIGATE | duplicate avatar state — define single source of truth (User.avatar_config is canonical) |
| `Profile` entity vs `MyAccount`/`Portfolio` | INVESTIGATE | overlapping identity surfaces — consolidate |
| `PresenceLayer.js` stub + `colyseusRoom` fn | INVESTIGATE | decide multiplayer path before migration |
| 0 test files | ADD | critical flows untested (signup, avatar save, guest migration, checkout, ownership, membership) |

## Migration order (dependency-aware)
1. **Abstract** — introduce `skrtClient` shim delegating to `base44`; migrate call sites to it (app still runs on Base44).
2. **Repo hygiene** — remove dead shells/dupe ProtectedRoutes; settle avatar source-of-truth.
3. **Independent infra** — stand up Postgres/Mongo, auth provider, object storage, function runtime, email, analytics.
4. **Backend port** — Deno→Node functions (keep logic), `entitlementService` first (commerce-critical), then auth/me, saveAvatarProfile, then the rest.
5. **Schema migration** — translate entities + RLS; backfill `user_id` on `Order/Profile/Transaction`.
6. **Realtime** — replace `subscribe` + wire presence (or defer).
7. **Build** — drop `@base44/vite-plugin`, swap `base44Client` implementation.
8. **Seed/verify** — parity tests vs Base44 data; Stripe webhook URL cutover.
9. **Cutover** — DNS/hosting; decommission Base44.

## Missing production systems (independent target)
- **Before migration:** `INTERNAL_FUNCTION_SECRET` set; valid Stripe keys; admin route guard; avatar source-of-truth decision.
- **Before private beta:** independent auth + DB + storage + function runtime; email; webhook URL re-register; analytics.
- **Before public launch:** realtime/multiplayer decision; refund→revoke policy; rate-limit wiring; test suite for critical flows; monitoring/logs.
- **Post-launch:** Colyseus/presence; skating/skateboarding; World interiors expansion; room customization.