# Phase 1.4 — Stabilization Pass A

Status: **IN PROGRESS**. Phase 1.5 remains **LOCKED**.
Target: Skrtlife-Dev-phase1.4 / `6ab3d55363a10359643b4447`.
No production-app edits, database migrations, record deletions, real payments, new product features, or UI redesign.

## Corrections and evidence

| Fix | Proven source defect | Correction | Evidence / limit |
|---|---|---|---|
| Redirect enforcement | Browser supplied checkout destinations without server origin enforcement | Shared policy allows only the exact configured HTTPS origin; rejects production, localhost, userinfo, lookalikes, malformed URLs and other external origins; applied to membership, Genesis, shop and event checkouts | Local policy/handler tests; live development Membership/Genesis invalid destinations returned 400 without creating a session |
| Stripe test safety | Development checkout could initialize from a live key and return an unchecked session | Deployment ID selects development/test; reject non-test keys before Stripe construction; require session.livemode === false; expire an unexpected open session and never expose its URL | Mocked provider tests only for key/session-mode branches; no actual Checkout Session created |
| Genesis contract | Event path queried nonexistent user_email/status fields and could authorize from a flag alone | Grant and server event lookup share activeGenesisQuery(userId); explicit existing admin policy retained; malformed target ID returns 400 | Mocked canonical lookup/authorized retry/ordinary-user denial tests; live malformed target rejection 400 |
| Avatar stale writes | Canonical save replaced state without an observed revision | expectedRevision required; missing stored revision is 0; compare with authenticated account and re-read before write; successful save advances integer revision; 409 blocks stale save; all discovered frontend callers carry observed revision; default-body adapter delegates to saveAvatarProfile | Local sequential-save, identity, normalization and adapter tests; live missing-revision rejection 400; **read/compare/update is not atomic**, so simultaneous-write safety remains INCONCLUSIVE |
| Function provenance | URL/local-storage functions_version affected ordinary runtime | Build-pinned version or SDK deployment default; URL override only with DEV=true and explicit build opt-in; production ignores it; local storage not consulted | Local production/development override tests and source assertion |
| Development email origin | Genesis email linked to production | Email uses trusted server deployment origin after webhook signature validation; same configuration owns checkout redirects | Local source/configuration assertion; actual email delivery not exercised |

## Canonical contracts

- `User.avatar_config`: avatar profile authority, `schema_version: 2` unchanged; integer `revision` separate from schema version.
- `saveAvatarProfile`: canonical full-state writer, authenticated caller only; identity is never selected from request userId. Payload `{ avatar_config, expectedRevision }`.
- Existing stored profiles with no revision: observed revision 0, next accepted save revision 1, no bulk data migration.
- Missing request expectedRevision: 400; different stored revision: 409; no automatic fetch-new-revision-and-retry that could overwrite another editor's state.
- `saveDefaultAvatar`: compatibility adapter requiring expectedRevision and forwarding to the canonical writer, not a second write authority.
- Guest migration: captures the authenticated profile revision before the existing keep/replace decision; failed migration retains the pending draft; autosave held while that draft is pending.
- DripSync and World: preserve revision through canonical normalization; successful save receipts update user state; revision is excluded from appearance fingerprints.
- `AssetOwnership`: wardrobe ledger unchanged; no ownership entity or client ledger introduced.
- Paid Genesis server entitlement: `GenesisPass.user_id` is the stable User ID and `GenesisPass.is_active === true`; grant and lookup use the same predicate; existing administrator event-access policy remains a role exception, not a fabricated pass.
- Legacy email/status records and flag-only accounts: untouched, no email-based fallback or automatic self-grant; require reviewed reconciliation if they lack a canonical active record. Existing frontend flags remain projections/UI compatibility, not the event backend's paid-access authority.
- Prices: existing server-defined prices and authenticated checkout identity unchanged.
- Payments: verified Stripe webhook remains fulfillment authority.
- Deployment configuration: server-owned registry keyed by BASE44_APP_ID, never request origin; development entry uses `https://skrtlifedevphase14-643b4447.base44.app` and test mode. Unknown IDs fail closed. A future production deployment requires its own reviewed entry with production/live and an independently configured origin; no production app is configured or modified here.

## Changed files (grouped)

Backend handlers:
- `base44/functions/membershipCheckout/entry.ts`
- `base44/functions/genesisCheckout/entry.ts`
- `base44/functions/createCheckout/entry.ts`
- `base44/functions/createEventCheckout/entry.ts`
- `base44/functions/grantGenesisPass/entry.ts`
- `base44/functions/saveAvatarProfile/entry.ts`
- `base44/functions/saveDefaultAvatar/entry.ts`
- `base44/functions/stripeWebhook/entry.ts`

Backend policy/model:
- `base44/shared/deploymentPolicy.js` (new)
- `base44/shared/checkoutSafety.js` (new)
- `base44/shared/genesisContract.js` (new)
- `base44/shared/avatarRevision.js` (new)
- `base44/shared/serverConfiguration.js`
- `base44/shared/avatarValidation.js`
- `base44/shared/avatarConfigServer.js`
- `base44/entities/User.jsonc`

Frontend callers and normalization:
- `src/lib/functionVersion.js` (new)
- `src/lib/app-params.js`
- `src/lib/avatarConfig.js`
- `src/lib/avatarPersistence.js`
- `src/hooks/useAvatarPersistence.js`
- `src/dripsync/react/useAvatarActions.js`
- `src/game/ui/dripsync/worldDripShared.js`
- `src/components/avatar/AvatarOnboarding.jsx`
- `src/pages/DripSync.jsx`

Verification/documentation:
- `tests/phase14/handlerHarness.js` (new)
- `tests/phase14/avatarRevision.test.js` (new)
- `tests/phase14/checkoutPolicy.test.js` (new)
- `tests/phase14/provenance.test.js` (new)
- `src/docs/PHASE_1_4_CONCURRENCY_PLAN.md` (new)
- This report (new)

User schema note: the platform rejected the pre-existing custom declarations of built-in identity fields when saving the revision addition. Redundant id/email declarations were omitted because those fields are platform-managed, not removed from User records. A semantic comparison against the initial schema confirmed no changes beyond revision and those redundant declarations; existing role/custom-field rules were preserved.

## Verification results

No existing test script or test/spec files were found at the start. Added offline Node tests using mocked services; no testing package added.

| Command | Result | Classification |
|---|---|---|
| `node --test tests/phase14/*.test.js` | 24 passed, 0 failed | PASS — local/source/mocked tests only |
| `npm run build` | exit 0 | PASS; pre-existing outdated Browserslist-data warning retained |
| `npm run lint -- --format json` | exit 1; 217 errors before and after | KNOWN BASELINE FAILURE; no new error diagnostics |
| `npm run typecheck` | exit 2; 3066 errors before, 3063 after | KNOWN BASELINE FAILURE; no new error diagnostics after corrections |
| `git diff --check` | exit 0 | PASS |

Diagnostic comparison used file + rule/message for lint and file + TypeScript error/message without shifted line numbers for typecheck. This comparison does not assert the project is type-clean.

An intermediate new callback-option typing regression was corrected before the final run. A malformed Genesis target initially surfaced as 500 during a non-mutating probe; the new canonical-query input error now maps to 400 and was retested. Historical 500/401/403 causes were not inferred or fixed.

### Non-mutating deployed validation probes

- membershipCheckout: missing redirects and production destination -> 400.
- genesisCheckout: missing redirects and external destination -> 400.
- createCheckout: empty cart -> 400.
- createEventCheckout: missing event ID -> 400.
- saveAvatarProfile: missing expectedRevision -> 400.
- saveDefaultAvatar: missing expectedRevision -> 400.
- grantGenesisPass: malformed userId object -> 400 on final retest.
- stripeWebhook: unsigned input -> 400 Invalid webhook signature.

These are narrow deployed-handler validation results, NOT authenticated-save, real Stripe test-session, complete webhook-fulfillment, multi-user isolation, or concurrency PASS evidence. Existing Deno entrypoints and environment access were preserved; no compatibility rewrite was made.

## Merger discipline

- **KEEP**: existing admin portal and workflows; canonical avatar writer, ownership ledger, webhook fulfillment; shared frontend/backend normalization needed by current runtime boundaries.
- **KEEP**: saveDefaultAvatar public compatibility endpoint, now a forwarding adapter; no known in-app direct caller found, external consumers not assumed absent.
- **MERGE LATER**: frontend EntitlementManager/PurchaseReconciler/DripSyncRepository grant path competing with verified-webhook ownership; legacy user-flag-only Genesis UI semantics; legacy AvatarStore save hook pending consumer audit.
- **REMOVE LATER**: superseded browser grant implementations only after callers, permissions and replacement flows are proven; no deletions in this pass.
- **SAFE TO REMOVE NOW / superseded in-place**: local-storage function-version selection; event email/status Genesis predicate and unbacked flag bypass; direct default-avatar User write; hard-coded Genesis production email link; redundant built-in User field declarations rejected by the schema validator.

No untouched controller/route/UI cleanup, no auth-method change, no RLS overhaul, no provider-runtime migration, and no database record migration.

## Remaining blockers and exact next step

- Avatar optimistic checks still have a simultaneous-read race; no documented/verified native CAS or durable serialized writer guarantee yet.
- Ownership, Genesis and purchase-fulfillment concurrent duplicate protection remains unresolved; see the separate concurrency plan.
- Actual Stripe test credentials/session mode, webhook endpoint/secret pairing and end-to-end fulfillment remain unproven.
- GitHub authoritative revision/connection parity remains unverified; no commit or push performed by this pass.
- Baseline lint/typecheck failures remain visible and unresolved.
- Deploy frontend and revision-requiring functions together; old clients lacking expectedRevision receive 400 rather than a compatibility bypass.

Next Phase 1.4 step: Codex review/selective integration of this targeted diff into the authoritative repository, then verify the exact development runtime/database and disposable account identities before controlled authenticated-save and Stripe test-mode checks. Use the Testing Agent for live UI flows. Do not start Phase 1.5 or production cutover.