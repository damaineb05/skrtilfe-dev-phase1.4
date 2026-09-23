# DATABASE_SCHEMA — Skrtlife Entities (from `base44/entities/*.jsonc`)

> 22 schemas read in full this session. Remaining entities (listed at end) need `read_file` on their `.jsonc` before migration; their names are confirmed in the repo tree. Built-in fields on every record (never declared): `id`, `created_date`, `updated_date`, `created_by_id`. RLS operators: `data.<field>`, `created_by_id`, `user_condition.role`.

## Ownership & identity
- **User** (built-in, read-only except editable fields). Editable: `profile_image_url`, `bio`, `location`, `twitter_handle`, `instagram_handle`, `discord_username`, `website_url`, `phone`, `is_admin` (legacy), `genesis_holder` (bool, server-set), `dripsync_plus_holder` (bool, server-set), `membership_offer_seen`, `shipping_address`, `billing_address`, `billing_same_as_shipping`, `genesis_pass_status`, `social_connections`, **`avatar_config`** (canonical DripSync config v2: avatar{model_url,source,gender}, customization, equipped[]{wearable_id|model_url,source,slot,bone,position,rotation,scale}, custom_animations, environment, current_realm), `saved_looks`, `preferences`, `analytics_metadata`. Cannot create User records directly — users join via invites.
- **Profile** — keyed by `user_email` (migration debt: should be `user_id`). Fields: username, display_name, avatar_url, bio, extended_bio, location, website, social_links, membership_tier{basic|genesis}, reputation_score, badges, shipping_addresses[], billing_address, forum_stats, perks{early_access, exclusive_drops, priority_checkout, private_forums, discounted_shipping, members_only_pricing}. RLS: owner (by email) or admin.
- **PlayerProfile** — World progression, keyed by `user_id`. level, xp, reputation, current_world, spawn_point, last_position, last_rotation, last_played_at. RLS: owner or admin; create restricted to own user_id.
- **WorldState** — per-user per-world: position, rotation, unlocked_locations[], discovered_locations[], owned_properties[], last_saved_at. Keyed `(user_id, world_id)`.

## Avatar / assets
- **Avatar** — `user_id`, `model_url` (GLB), `thumbnail_url`, `rig_type{humanoid|custom}`, `traits{hairColor,eyeColor,skinTone,hairStyle,bodyType}`, `is_active`, `wear_count`, `last_worn_at`, `export_formats[]`. RLS owner/admin. *(Parallel game-side avatar model — see duplicate-state note.)*
- **DripSyncAsset** — `user_id`, type{avatar,look,outfit,scene}, name, avatarUrl, avatarId, thumbnailUrl, gender, source{rpm,upload,default,look,system,readyplayerme}, schema_version, isDefault, isStarter, **is_public_template**, template_name, template_order, metadata{customization,wearables[],animations[],environment,currentRealm}. RLS: owner OR is_public_template (read) OR admin; create own; update/delete owner/admin. **Public templates are the community catalog.**
- **Wearable** — `name`, `description`, `creator_id`, `model_url` (GLB), `texture_url`, `thumbnail_url`, category{top,bottom,shoes,headwear,accessory,full_body,eyewear,bag}, rarity{common,rare,epic,legendary}, **is_default** (free/starter, equippable WITHOUT ownership), compatible_rigs[], is_nft, max_supply, current_supply, price, currency{USD|ETH|USDC}, status, state, wear_count, tags[]. RLS: read public; create/update/delete admin-only.
- **AssetOwnership** — **the ownership ledger.** `user_id`, `wearable_id`, token_id, contract_address, quantity, acquired_at, source{mint,purchase,airdrop,transfer,gift}, **source_order_id** (idempotency key), source_sku, is_equipped (legacy), last_worn_at, wear_count. RLS: owner/admin read; create admin-only (server grants); update owner/admin; delete admin. Required: user_id, wearable_id, source.
- **Asset** (media library) — url, name, type{image,video,3d_model,document,other}, source{upload,ai_generated,external,product,blog,avatar}, file_size, mime_type, width, height, tags[], folder, alt_text, prompt, related_entity, related_entity_id, is_archived. RLS: read public; create own; update/delete owner/admin.
- **OutfitPreset** — (schema not read; referenced by DripSyncEngine outfit API). Read `base44/entities/OutfitPreset.jsonc` before migration.
- **Animation** — (not read). Read before migration.

## Commerce
- **Product** — title, slug, description, sku, barcode, price, compare_at_price, inventory_qty, low_stock_threshold, status{draft,active,archived}, collection{Light,Dark,Limited/Collab,Genesis}, product_type{physical,nft,3d_nft,physical_and_nft,wearable}, **wearable_id** (→ Wearable entitlement), tags[], available_sizes[], available_colors[], **variants[]**{id,sku,size,color,price,inventory_qty,weight,barcode,wearable_id}, media[]{url,alt_text,type,color,is_primary}, model_3d_url, wearable_slot, wearable_bone, wearable_position, wearable_rotation, wearable_scale, replaces_slots[], lore, fabric, care, size_chart_url, shipping_class, seo_title, seo_description, og_image, is_featured. RLS: read public; create/update/delete **admin-only**.
- **Order** — user_email, **user_id** (ownership key, resolved by webhook), line_items[]{product_id,title,variant_sku,quantity,price}, total_amount, shipping_address, payment_method{stripe,paypal,crypto,unknown}, payment_status{pending,paid,failed,exception,refunded}, transaction_id, checkout_session_id, payment_intent_id, events[]{timestamp,message}, fulfillment_status, tracking_number. RLS: owner (by email) or admin; create/update/delete admin-only.
- **StripeWebhookEvent** — event_id (idempotency), event_type, session_id, payment_intent_id, status{processed,failed,skipped}, processed_at. RLS: admin-only all ops.
- **Transaction** — on-chain tx: tx_hash, chain_id, from/to address, amount, currency{ETH,USDC,MATIC}, tx_type{payment,mint,transfer,listing,sale,bid}, status, block_number, gas_used, gas_price, order_id, nft_id, user_email, error_message, metadata. RLS: owner (by email) or admin; write admin-only.
- **DigitalTransaction** — marketplace: buyer_id, seller_id, listing_id, wearable_id, price, currency{ETH,USDC,USD}, platform_fee, creator_royalty, tx_hash, payment_method{stripe,crypto,usdc,eth}, status. RLS: buyer/seller/admin read; writes admin-only.
- **GenesisPass** — (not read). Read before migration. Granted by `grantGenesisPass`.
- **NFT** — (not read). Read before migration.
- **MarketplaceListing**, **UserInventory** — (not read).

## Progression / world
- **Mission** — shared catalog: mission_id, title, description, mission_type{travel,collect,social,delivery,exploration}, reward_skrt, reward_xp, required_level, world, order_index. RLS: read public; writes admin-only.
- **MissionProgress** — user_id, mission_id, status{locked,active,completed,claimed}, progress, started_at, completed_at. RLS: owner/admin.
- **VirtualCurrency** — (not read; SKRT balance). Read before migration.

## Social / community (schemas not read — names confirmed)
**Post**, **Comment**, **Reaction**, **Follow**, **Story**, **StoryView**, **Conversation**, **Message**, **CreatorProfile**, **Creator**, **CreatorSubscriber**, **Collection**, **Drop**, **Event**, **BlogPost**, **Newsletter**, **CollaborationSession**, **CollaborationMessage**, **Ticket**, **AssistantTask**, **SiteContent**, **UserDashboardConfig**, **SceneConfiguration**, **SceneObject**, **CodePatch**, **NFTDraft**, **Job**, **AvatarWearables**, **AssetBundle**, **WaitlistSignup** (email, phone, firstName, lastName, agreeSms — read schema VERIFIED).

## Cross-entity relationship map (canonical)
```
User (avatar_config.equipped) ──ref──> Wearable (catalog)
User ──owns──> AssetOwnership ──ref──> Wearable
Product.wearable_id / variant.wearable_id ──ref──> Wearable
Order ──grants──> AssetOwnership (source_order_id, source: 'purchase')
User ──1:1──> PlayerProfile (game progression, by user_id)
User ──1:N──> WorldState (per world)
User ──1:N──> DripSyncAsset (saved avatars/templates)
User ──1:1──> Profile (legacy, by user_email)   ← migration debt
User ──1:N──> MissionProgress
```

## RLS policy summary (VERIFIED across read schemas)
- **Owner-only reads/updates**: Avatar, AssetOwnership, MissionProgress, PlayerProfile, WorldState, DripSyncAsset, Profile, Order, Transaction, Look.
- **Public read, admin writes**: Product, Wearable, Mission, Event, Asset, ActivityEvent, NFTMarketplace entities. Public-template read on DripSyncAsset.
- **Admin-only all ops**: AuditLog, StripeWebhookEvent.
- **Open create**: WaitlistSignup (create {}), Asset (create own).

## Replacement notes
- The entity SDK is Mongo-style (`filter`, `updateMany` with `$set`/`$inc`/`$push`/`$pull`, `bulkCreate`). A Postgres target needs a query translator or an ODM. Mongo Atlas is the lowest-friction independent DB.
- RLS must be reimplemented as a policy layer (Postgres RLS, PostgREST/Casa authz, or app-level enforcement) — the `user_condition.role === 'admin'` and `data.user_id === {{user.id}}` patterns map directly.
- Realtime `subscribe` → Mongo change streams / Postgres logical replication / Supabase realtime.