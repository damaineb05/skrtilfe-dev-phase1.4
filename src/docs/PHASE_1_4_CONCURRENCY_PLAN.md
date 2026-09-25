# PHASE 1.4 CONCURRENCY PLAN

Status: DESIGN ONLY — no concurrency-safety PASS, no new lock service, no ledger migration.
Target: Skrtlife-Dev-phase1.4 / 6ab3d55363a10359643b4447.

## Native datastore capabilities — evidence, not assumptions

Documentation consulted during Stabilization Pass A:
- https://docs.base44.com/developers/backend/resources/entities/entity-schemas
- https://docs.base44.com/developers/references/sdk/docs/type-aliases/entities

| Mechanism | Evidence status |
|---|---|
| Entity unique constraints | Documentation explicitly says unsupported |
| Multi-record transactions | Not established by available documentation |
| Atomic create-if-absent/upsert | Not established |
| Compare-and-set | Not established |
| Datastore-enforced idempotency key | Not established |
| updateMany(query, updates) | Documented, but conditional atomicity / matched-versus-modified count guarantees not established |
| updateMany on built-in User | Not specifically established |
| Another native durable locking primitive for entity CRUD | Not established |

Do not infer CAS from a Mongo-shaped query or `$inc`, do not treat bulkCreate as a transaction, and do not invent an upsert API. Stripe request idempotency is a provider feature, not uniqueness for Base44 ownership/order rows.

## Sensitive canonical paths

| Location | Read/check -> write | Smallest reliable design to evaluate |
|---|---|---|
| base44/shared/entitlementService.js | AssetOwnership lookup by user_id + wearable_id + source_order_id -> create | Serialize on this composite key; durable completion receipt; retry must return existing canonical row |
| base44/functions/grantGenesisPass/entry.ts | activeGenesisQuery(user_id) -> create active GenesisPass | Serialize all grants for a user; recheck canonical record inside serialization boundary |
| grantGenesisPass pass numbering | count all passes -> pass_number = count + 1 | Separate durable atomic sequence/global serialized allocator; per-user lock alone does not protect numbering |
| base44/shared/checkoutRecovery.js + stripeWebhook | Order checkout_session_id lookup -> createOrder -> fulfillment -> completion marker | Durable per-session serialized coordinator with recoverable stage receipts; inventory writes also need product/variant protection |
| checkoutRecovery webhook receipt | StripeWebhookEvent event_id lookup -> create | Event-key serialization, coordinated with the session-key fulfillment boundary |
| stripeWebhook refund/dispute audit | event_id lookup -> receipt create -> AuditLog create | Serialized event processing with completion marked only after durable audit success |
| stripeWebhook stock update | Read inventory -> compute subtraction -> update | Atomic inventory decrement or serialized per-product/SKU mutation, with an applied-effect receipt for crash recovery |
| stripeWebhook membership flags / Genesis projection | Order processing -> multiple User/pass/grant writes | Recoverable per-session stages; canonical pass before treating projection as complete; coordinate with user-level grant serialization |
| saveAvatarProfile -> avatarRevision.js | Read current revision -> compare -> User.update | Genuine conditional write on (authenticated user ID, expectedRevision), or one durable serialized writer per user; current optimistic check is NOT atomic |
| saveDefaultAvatar | Read observed state -> delegate to saveAvatarProfile | Same canonical writer and user serialization boundary; no independent persistence |

## Adjacent competing/legacy paths (unchanged)

- `src/dripsync/commerce/EntitlementManager.js` via `DripSyncRepository.createOwnership/updateOwnership`: client-side ownership lookup then create/increment, conflicting with verified-webhook authority and boolean entitlement semantics. **MERGE LATER**, then **REMOVE LATER** after consumers are proven rerouted; never use this as concurrency protection.
- `createEventCheckout` checks for an existing ticket before creating a Stripe session, but `eventWebhook` creates a Ticket without a fulfillment retry receipt and performs read-modify-write on tickets_sold. Plan session-level fulfillment deduplication plus event-capacity serialization; checkout's early lookup is not a fulfillment lock.
- `GameStateAdapter`: profile, wallet, world-state, and mission-progress lookup/create plus reward read-modify-write. Recorded as adjacent risk only; no World/game changes in this pass.
- On-chain mint/Transaction behavior is a separate external side-effect path; not proven idempotent by this pass and not used to authorize canonical paid Genesis access.

## Smallest reliable implementation decision

1. First obtain documented and development-tested conditional-write guarantees for the actual User/entity runtime; if supported, prefer a single conditional User avatar update and native unique/idempotent inserts for the ledgers.
2. If not supported, propose one narrowly scoped durable serialization/coordinator service backed by a datastore with documented atomic primitives, not a second ownership/avatar authority. Keep User.avatar_config, AssetOwnership, GenesisPass, and Orders canonical where they are.
3. All competing writers must pass through the coordinator; a lock used by only the webhook is insufficient while browser or legacy writers remain possible.
4. An expiring lock alone is insufficient: require fencing or a non-overlapping durable single writer, durable retry receipts, and recovery for crashes between an external entity write and recording completion. Without this, do not claim exactly-once effects.
5. No in-memory mutex, timestamp token, lookup-before-create, or a lock entity created with the same non-atomic CRUD is acceptable proof.
6. For a strict exactly-once guarantee that cannot be obtained across the current store and coordinator, document that blocker rather than claiming a lock solves it; a later transactional canonical-store change requires separate approval.

## Required development evidence

Use disposable accounts/data in an explicitly selected development database. Run simultaneous and repeated deliveries for the same event/session/user/grant key; verify record counts and stage receipts after completion, timeout, worker restart, and retry. Race two avatar saves with the same expectedRevision: exactly one must succeed and the other must receive 409 before atomicity can be marked PASS. Confirm inventory and pass_number behavior across different sessions/users sharing the same resource.

Phase 1.4 remains IN PROGRESS; Phase 1.5 remains LOCKED.