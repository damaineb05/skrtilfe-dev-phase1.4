# SYSTEM_ARCHITECTURE — Skrtlife Digital Society (Forensic Audit)

> Audit date: 2026-09-21. All claims below are traced to specific files read during this audit. "VERIFIED" = file read in full this session. "LISTED" = present in repo tree / context snapshot, not fully re-read.

---

## 1. EXECUTIVE INVENTORY

| Layer | Actual implementation | Source of truth | Base44-dependent? |
|---|---|---|---|
| Framework | React 18.2 + Vite 6 (ESM, `"type":"module"`) | `package.json` VERIFIED | No (portable) |
| Build system | Vite + `@base44/vite-plugin` ^1.0.41 | `vite.config.js` VERIFIED | **YES — plugin injects platform runtime** |
| Styling | Tailwind 3.4 + shadcn/ui (Radix) + custom tokens | `tailwind.config.js`, `src/index.css` VERIFIED | No |
| Routing | react-router-dom 6 ( declarative `<Route>` ) | `src/App.jsx`, `src/pages.config.js` VERIFIED | No |
| State | React Context (`AuthContext`), TanStack Query, localStorage, custom class stores (`DripSyncStore`) | VERIFIED | Partial (auth context calls platform) |
| 3D engine | three ^0.171 (raw Three.js, not R3F) | `src/game/*`, `src/dripsync/*` VERIFIED | No |
| Avatar provider | Ready Player Me (GLB URLs) + user uploads | `src/lib/defaultAvatars.js`, `src/components/utils/rpmHelpers.jsx` LISTED | No |
| Database | Base44 entities (Mongo-style) via `base44.entities.*` | `base44/entities/*.jsonc` VERIFIED (22 schemas) | **YES** |
| Auth | Base44 platform auth (tokens/sessions/email verify owned by platform) | `src/lib/AuthContext.jsx` VERIFIED | **YES** |
| Storage | Base44 `UploadPublicFile` / `UploadPrivateFile` integrations | `base44_client` VERIFIED | **YES** |
| Server functions | Deno functions via `@base44/sdk` `createClientFromRequest` | `base44/functions/*/entry.ts` VERIFIED (4 read) | **YES** |
| Payments | Stripe (npm:stripe@14) inside Deno functions | `createCheckout`, `stripeWebhook` VERIFIED | Portable (Stripe is independent) |
| Email | Base44 `Core.SendEmail` integration | `stripeWebhook` VERIFIED | **YES** |
| Realtime | `base44.entities.<Name>.subscribe` + `PresenceLayer` stub | `src/game/multiplayer/PresenceLayer.js` LISTED (stub) | **YES (subscription)** / stub (presence) |
| Analytics | `base44.analytics.track` + vite plugin `analyticsTracker` | VERIFIED | **YES** |
| Hosting | Base44 managed hosting + `@base44/vite-plugin` | `vite.config.js` VERIFIED | **YES** |

### Dependency classification (key items)
- **PORTABLE**: React/Vite/Tailwind/three UI, react-router, TanStack Query, framer-motion, Stripe SDK (`@stripe/react-stripe-js`), recharts, react-leaflet, all Radix shadcn components.
- **PARTIALLY PORTABLE**: Auth (UX uses platform redirect; the `AuthContext` shell is reusable but the token/session backend is platform-owned), entity SDK call sites (pattern is portable; the transport is not).
- **BASE44-DEPENDENT**: `@base44/sdk` (`createClient`, `createClientFromRequest`, `entities`, `auth`, `functions`, `integrations`, `asServiceRole`, `users`, `analytics`, `subscribe`), `@base44/vite-plugin`, the `/api/apps/public/.../public-settings` platform endpoint, Deno function runtime, Base44 entity store, Base44 file storage, Base44 email, Base44 hosting.
- **UNKNOWN**: Exact production CDN/object-storage backing UploadPublicFile; internal platform multi-tenancy — not inspectable.

---

## 2. REPOSITORY MAP (major directories, verified against file tree)

```
src/
  App.jsx                 # Router + AuthProvider/QueryClient/Toaster wrappers (VERIFIED)
  pages.config.js         # PAGES map + Layout (VERIFIED) — NO LONGER auto-generated
  Layout.jsx              # Global layout: DualModeNav + FloatingDock + footer (VERIFIED)
  index.css               # Design tokens + glass utilities (VERIFIED)
  api/base44Client.js     # SDK client init (VERIFIED) ★ BASE44
  lib/
    AuthContext.jsx       # Platform auth bridge (VERIFIED) ★ BASE44
    app-params.js         # appId/token/functionsVersion/appBaseUrl (LISTED) ★ BASE44
    avatarConfig.js / avatarPersistence.js  # canonical avatar config + secure save (VERIFIED)
    membershipPlans.js / membershipAccess.js # tier config + genesis gate (VERIFIED plans)
    query-client.js, utils.js, contextualHints.js, guestAvatarMigration.js
  pages/                  # ~40 routed pages (Home, Shop, DripSync, World, MyAccount, Membership, Checkout, Admin*, …)
  components/
    ui/                   # shadcn primitives + custom (button, dialog, ContextualHint, PageTransition…)
    layout/               # DualModeNav, FloatingDock, NavDrawer, NavTicker, DraggableMessengerButton
    dripsync/ + dripsync2/ # DripSync editor UI (huge) — viewport, panels, closet, marketplace, mobile
    game/ (SkrtWorld.jsx + core/player/world/interaction/npc/vehicle/save/ui/multiplayer) VERIFIED SkrtWorld
    streaming/            # XUMO Play Streaming Hub (just rewired this session)
    shop/, product/, checkout/, account/, admin/, messaging/, community/, genesis/, identity/, home/
  dripsync/                # Framework-agnostic DripSync runtime: core, avatar, closet, outfit, scene, movement, commerce, react/
  game/                    # Three.js World engine (decoupled from React UI per directive)
base44/
  entities/               # ~52 entity schemas (jsonc) — DB + RLS ★ BASE44
  functions/              # 18 Deno backend functions ★ BASE44
  shared/                 # entitlementService.js, avatarConfigServer.js (shared by functions)
  workflows/              # (none active confirmed this session)
  agents/, mcp/           # present in tree
  config.jsonc
```

### Dead / duplicate / legacy signals found
- `src/pages.config.js` comments: `Profile` (legacy, superseded by Portfolio/MyAccount), `Wallet` & `Events` disabled as "BACKEND-LOCKED SHELL" (simulated/disabled until plan upgrade).
- `src/App.jsx` duplicates several routes that also exist in the `pagesConfig` loop (e.g. MyAccount, Realms, Discover, Drops, Membership, Closet, Feed) — explicit `<Route>` entries alongside the loop. Per platform note, new routes must be added explicitly.
- `Avatar` entity vs `DripSyncAsset` entity vs `User.avatar_config`: three avatar representations coexist (see §8). Canonical = `User.avatar_config`; `Avatar` entity is a parallel game-side model; `DripSyncAsset` is the saved-avatar/template store.
- `Profile` entity vs `MyAccount`/`Portfolio` pages vs `User` record: overlapping identity surfaces (decision: consolidate into MyAccount — partially done).
- `PresenceLayer` (`src/game/multiplayer/PresenceLayer.js`) is a STUB — no real multiplayer transport.
- `colyseusRoom` backend function exists (LISTED) but `PresenceLayer` is stubbed → multiplayer not wired end-to-end.

---

## 3. ROUTE + PAGE AUDIT (from `src/App.jsx` + `pages.config.js`, VERIFIED)

**Main route:** `/` → `Home` (wrapped in `LayoutWrapper`).

**Explicit `<Route>` entries in App.jsx (outside the pagesConfig loop):**
`/MyAccount`, `/AdminModeration`, `/AdminWearables`, `/AdminAvatars`, `/AdminOrders`, `/Realms`, `/Risktakers`, `/Portfolio`, `/CollectionDetail`, `/Auth`, `/Discover`, `/Drops`, `/Notifications`, `/SavedLooks`, `/Onboarding`, `/Feed`, `/Membership`, `/Closet`, `/AvatarOS`, `/World` (lazy), `/MembershipSuccess`, `/oauth/consent`, `*` (404).

**pagesConfig loop routes:** About, AdminAnalytics, AdminAssetUpload, AdminAssets, AdminAssistant, AdminCollectionEdit, AdminContent, AdminCustomers, AdminDashboard, AdminInventory, AdminMarketplace, AdminProductEdit, AdminSettings, AdminStockAdjust, Analytics, Blog, BlogPostDetail, Cart, Checkout, CheckoutCancel, CheckoutSuccess, Community, Contact, Dashboard, DripSync, FAQ, Genesis, GenesisCheckoutSuccess, Home, MyOrders, NFTMarketplace, PrivacyPolicy, ProductDetail, ReturnsPolicy, Settings, Shop, SizeGuide, TermsOfService.

**Auth model:** `requiresAuth:false` on the SDK client (VERIFIED `base44Client.js`) → public app. `AuthContext` calls platform `/api/apps/public/prod/public-settings/by-id/<appId>`; if `appParams.token` exists it calls `base44.auth.me()`. Per-route gating is done in-page via `useAuth()` (e.g. `SkrtWorld` shows login prompt if `!user`). `ProtectedRoute.jsx` exists (VERIFIED) but App.jsx does NOT wrap routes in it — gating is ad-hoc per page.

**Admin gating:** Admin pages are rendered as plain routes (no `ProtectedRoute` wrapper in App.jsx). Security relies on (a) backend RLS (`user_condition.role === 'admin'` on admin entities — VERIFIED across Product/Wearable/Order/etc.) and (b) in-page `user.role === 'admin'` checks (per decisions). **Gap:** no centralized admin route guard in the router — see SECURITY_AUDIT.

**Navigation graph (high level):**
Home → Shop → ProductDetail → Cart → Checkout → CheckoutSuccess; Home → DripSync → (save) → MyAccount; DripSync ↔ World (in-world DripSyncTabletOverlay + `/World` route); Membership → membershipCheckout → MembershipSuccess; World → Store overlay → ProductDetail; Community/Feed/Discover/Notifications social surface.

---

## 4–33. Condensed findings (see companion docs for depth)

- **User journey:** Visitor → Home → DripSync (guest edit) → avatar save → auth/signup → Membership offer → Shop → ProductDetail (try-on) → Cart/Checkout → Ownership → Wardrobe/Closet → World. **Disconnected transitions:** Wallet & Events pages are backend-locked shells (disabled in routing). `Avatar` vs `DripSyncAsset` vs `User.avatar_config` ownership keying is partially migrated (snapshot: "Entities using user_email as ownership key require future user_id migration" — e.g. `Profile`, `Order` RLS keys on `user_email` OR `user_id`).
- **Auth:** Platform-owned. Signup/login/logout/session/token/email-verify all via `base44.auth.*`. Guest → account migration via `guestAvatarMigration.js`. No custom login page (platform redirect). **Privilege escalation risk:** admin route guard is not centralized; admin authority ultimately enforced by RLS + server functions (good) but UI route exposure depends on per-page checks.
- **Commerce:** VERIFIED secure-by-design. `createCheckout` ignores client price/email, resolves server-side, Stripe session. `stripeWebhook` verifies signature, double idempotency (StripeWebhookEvent + Order.checkout_session_id), grants ownership via `grantEntitlementsForOrder` (internal-secret gated). Membership flags (`genesis_holder`, `dripsync_plus_holder`) set server-side only. **Blocker:** `INTERNAL_FUNCTION_SECRET` is NOT in the existing secrets set → `grantEntitlementsForOrder` is currently fail-closed 403; `STRIPE_SECRET_KEY` reported expired (known issue) → checkout non-functional until rotated.
- **Membership:** 3 tiers (FREE/DripSync+ $2.99 mo / Genesis $299 lifetime) in `membershipPlans.js` VERIFIED. Authoritative flags on `User`. `hasGenesisAccess` reads `genesis_holder` (admins inherit).
- **DripSync (§7):** `DripSyncEngine` is a DATA orchestrator only (repository/store/events/closet/loadout/outfit/entitlements). Movement/avatar runtime lives in the viewport — single input layer (`ViewportInput`), single movement controller (`ViewportControls.updateMovement`), single transform owner (viewport `modelRef`). The old split (engine vs viewport movement) was resolved (engine comment VERIFIED).
- **Avatar (§8):** RPM GLBs + uploads. Canonical config = `User.avatar_config` (schema v2). World & DripSync share the same identity source (`buildWorldAvatarSpec(user)` from `User.avatar_config` VERIFIED in SkrtWorld). `Avatar` entity is a parallel game-side model — potential duplicate state.
- **Clothing/Wardrobe (§9):** `Product.wearable_id` / `variant.wearable_id` → `Wearable.model_url` (GLB) → `AssetOwnership` ledger → equipped in `User.avatar_config.equipped`. Ownership enforced server-side by `saveAvatarProfile` (rejects unauthorized `wearable_id` with 403). Try-on (`fromShop/isPreview/isDemo`) is runtime-only, filtered out of persistence (VERIFIED `avatarPersistence.js`).
- **World (§13):** Production Three.js shell. Districts: flagship store, Five Lines gallery, DripSync lab (in-world overlay), garage (vehicle placeholder), event space (toast only). Interactions typed (`InteractionType` VERIFIED). Status: movement/camera/interaction/save = FUNCTIONAL; NPC/vehicle = PARTIAL (placeholders); presence/multiplayer = STUB; skating/skateboarding = NOT IMPLEMENTED.
- **Multiplayer (§17):** `PresenceLayer` = stub. `colyseusRoom` function exists but not wired to client presence. No real-time position/animation sync.
- **Community/Social (§20):** Entities exist (Post, Comment, Follow, Reaction, Story, StoryView, Conversation, Message, CreatorProfile, CreatorSubscriber). Functional status NOT fully traced UI→DB this session — mark PARTIAL/UNKNOWN.
- **State (§23):** `AuthContext` (user/auth), TanStack Query (server cache), localStorage (cart, `sh_fav2`/`sh_hist2`, onboarding flags), `DripSyncStore` class (DripSync session), `AvatarSessionStore` (decision). Canonical sources: User=AuthContext; Avatar=`User.avatar_config`; Wardrobe=AssetOwnership+equipped; Membership=User flags; Cart=localStorage; World=PlayerProfile/WorldState. **Duplicate-state risk:** `Avatar` entity vs `User.avatar_config`.
- **Base44 dependency (§24):** See `BASE44_DEPENDENCY_MAP.md`.
- **API contracts (§25):** See `API_CONTRACTS.md`.
- **Env vars (§26):** `STREAMOJI_CLIENT_SECRET/ID`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (existing). **Missing:** `INTERNAL_FUNCTION_SECRET`, `BASE44_APP_ID`, `BASE44_TOKEN` (platform-injected). All SECRET/server-only; none exposed to client intentionally.
- **Security (§27):** See `SECURITY_AUDIT.md`.
- **Performance (§28):** `World` is lazy-loaded (`React.lazy` in App.jsx VERIFIED). 3D assets via `AssetRegistry` with GLB cache + `clearGLBCache` on unmount (VERIFIED SkrtWorld). DripSync viewport is the heavy path — not audited for draw calls this session.
- **Mobile (§29):** Touch detection in SkrtWorld (`pointer: coarse`) → `TouchControls`. DripSync has separate mobile layouts/sheets (`MobileDripSyncLayout`, `MobilePanelSheet`, `DragJoystick`). Mobile & desktop share one engine (per DripSync engine comment).
- **Testing (§33):** No test files found in tree (no `*.test.*`, no playwright/cypress/vitest config). Coverage = 0.
- **Deployment (§34):** `vite build` → static bundle on Base44 hosting. Deno functions deployed as Base44 server functions. Webhook URL: `https://<app>.base44.app/functions/<name>`.