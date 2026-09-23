# BASE44_DEPENDENCY_MAP — Skrtlife → Independent

> Every place the platform is required, what it touches, and what an independent replacement must provide.

## Surface inventory (VERIFIED in code)

### A. SDK client — `src/api/base44Client.js`
```
import { createClient } from '@base44/sdk';
export const base44 = createClient({ appId, token, functionsVersion, serverUrl:'', requiresAuth:false, appBaseUrl });
```
**Used by:** virtually every page/component that reads or writes data, auth, or integrations.
**Replacement:** a thin client (`skrtClient`) exposing the same surface (`entities`, `auth`, `functions`, `integrations`, `asServiceRole`, `users`, `analytics`, `subscribe`) against your own API gateway + DB.

### B. Auth — `src/lib/AuthContext.jsx`
- `base44.auth.me()` — current user (VERIFIED)
- `base44.auth.logout(redirectUrl)` / `base44.auth.redirectToLogin(nextUrl)`
- Platform endpoint: `createAxiosClient({ baseURL:'/api/apps/public' })` → `GET /prod/public-settings/by-id/<appId>` (VERIFIED) — determines auth_required / user_not_registered.
- `appParams.token` — platform-injected session token.
**Replacement:** independent auth provider (Supabase Auth / Auth0 / Clerk / custom JWT). Replace `me()` with `/auth/me`, `redirectToLogin` with your login route, drop the `/api/apps/public` public-settings call (replace with an app-config endpoint).

### C. Entities (database) — `base44.entities.<Name>`
Methods used (VERIFIED across code + snapshot): `list`, `filter`, `get`, `create`, `bulkCreate`, `update`, `updateMany`, `bulkUpdate`, `delete`, `deleteMany`, `schema`, `subscribe` (realtime).
`base44.asServiceRole.entities.*` — service-role bypass of RLS (VERIFIED in `stripeWebhook`, `grantEntitlementsForOrder`, `entitlementService.js`).
**Replacement:** a data layer over Postgres/Mongo + an RLS-equivalent policy engine. The call pattern (`entities.X.filter({...})`) maps cleanly to a REST/ RPC gateway. Realtime via Postgres LISTEN/NOTIFY, Supabase realtime, or a WebSocket fan-out.

### D. Backend functions — `base44/functions/*/entry.ts`
All 18 functions are **Deno** handlers using `createClientFromRequest(req)` from `@base44/sdk` (VERIFIED `createCheckout`, `stripeWebhook`, `grantEntitlementsForOrder`). Pattern:
```
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.x';
Deno.serve(async (req) => { const base44 = createClientFromRequest(req); ... });
```
**Replacement:** Node/Edge functions on your hosting (Cloudflare Workers, Vercel/Next API, Supabase Edge, self-host). Replace `createClientFromRequest` with a service client initialized from the request's auth context. Keep the same business logic (it's already server-authoritative and Stripe-verified).

### E. Integrations — `base44.integrations.Core.*`
- `SendEmail` (VERIFIED in `stripeWebhook`)
- `InvokeLLM`, `TranscribeAudio`, `GenerateImage`, `GenerateSpeech`, `GenerateVideo`, `UploadPublicFile`, `UploadPrivateFile`, `ExtractDataFromUploadedFile`, `CreateFileSignedUrl`
**Replacement:** Resend/SES/Postmark (email), OpenAI/Anthropic (LLM), your object storage (S3/R2/Supabase Storage) for file upload + signed URLs.

### F. Users / invites — `base44.users.inviteUser(email, role)`
**Replacement:** your auth provider's admin invite API.

### G. Analytics — `base44.analytics.track({ eventName, properties })` + vite plugin `analyticsTracker`
**Replacement:** PostHog / Mixpanel / GA4.

### H. Build & hosting — `@base44/vite-plugin`
`vite.config.js` (VERIFIED) uses `base44({ legacySDKImports, hmrNotifier, navigationNotifier, analyticsTracker, visualEditAgent })`. These are builder-time + hosting integrations.
**Replacement:** plain `@vitejs/plugin-react` (already present). Remove the base44 plugin. Host static build on Vercel/Netlify/Cloudflare Pages/self-host. Move functions to your function runtime.

### I. Public settings / app config
`/api/apps/public/prod/public-settings/by-id/<appId>` (VERIFIED) gates auth-required state.
**Replacement:** a public `/config` endpoint returning `{ authRequired, ... }` from your backend.

---

## Grouped replacement work

| Group | Base44 surface | Independent replacement | Touches |
|---|---|---|---|
| AUTH | `base44.auth.*`, `appParams.token`, `/api/apps/public` | Supabase Auth / Clerk / Auth0 + JWT; `/auth/me`, `/config` | `AuthContext.jsx`, `app-params.js`, every page using `useAuth` |
| DATABASE | `base44.entities.*`, `.asServiceRole`, `.subscribe` | Postgres + Drizzle/Prisma + policy layer; realtime via Supabase/WS | ~all data pages, all 18 functions, `entitlementService.js` |
| STORAGE | `UploadPublicFile`, `UploadPrivateFile`, `CreateFileSignedUrl` | S3/R2/Supabase Storage + signed URLs | avatar uploads, asset manager, streaming thumbnails |
| SERVER FUNCTIONS | `createClientFromRequest`, Deno runtime | Node/Edge functions on your host | `base44/functions/*/entry.ts` (18) |
| REALTIME | `entities.subscribe`, `PresenceLayer` stub | WS / Supabase realtime / Colyseus | SkrtWorld presence, entity live updates |
| HOSTING | base44.app + vite plugin | Vercel/Netlify/CF Pages + function runtime | `vite.config.js`, deploy pipeline |
| EMAIL | `Core.SendEmail` | Resend/SES | `stripeWebhook`, `sendOrderConfirmation`, `grantGenesisPass` |
| PAYMENTS | (Stripe is already independent) | Stripe (keep) | `createCheckout`, `stripeWebhook`, `membershipCheckout`, `genesisCheckout` |
| ANALYTICS | `base44.analytics.track` + plugin tracker | PostHog/Mixpanel | call sites + vite plugin |
| INTEGRATIONS | `InvokeLLM`, `GenerateImage`, etc. | Direct provider SDKs | any AI feature using them |

## Migration-critical files (highest blast radius)
1. `src/api/base44Client.js` — single client init; swap here first behind a compatibility shim.
2. `src/lib/AuthContext.jsx` — auth + public-settings; replace platform calls.
3. `src/lib/app-params.js` — platform-injected `appId/token`; replace with env-driven config.
4. `base44/shared/entitlementService.js` — uses `asServiceRole.entities.*`; core commerce logic, keep logic, swap client.
5. All 18 `base44/functions/*/entry.ts` — swap `createClientFromRequest` + Deno → your runtime.
6. `vite.config.js` — remove `@base44/vite-plugin`.
7. `package.json` — remove `@base44/sdk`, `@base44/vite-plugin`.

## Suggested abstraction (do this BEFORE swapping implementations)
Create `src/api/skrtClient.js` re-exporting a typed interface (`entities`, `auth`, `functions`, `integrations`, `users`, `analytics`, `subscribe`) that today delegates to `base44`, later delegates to your backend. Migrate call sites to `skrtClient` incrementally; flip the implementation once the independent backend exists. This keeps the app running on Base44 during migration and makes the cutover a single-file change.