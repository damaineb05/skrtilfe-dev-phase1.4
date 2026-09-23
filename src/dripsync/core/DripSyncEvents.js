/**
 * DripSyncEvents
 * Canonical event constants for the DripSync lifecycle.
 * All engine emissions use these keys — never raw strings.
 */

export const DripSyncEvents = Object.freeze({
  // Boot lifecycle
  BOOT_STARTED:    'dripsync:boot:started',
  BOOT_COMPLETED:  'dripsync:boot:completed',
  BOOT_FAILED:     'dripsync:boot:failed',

  // Data hydration
  AVATAR_LOADED:   'dripsync:avatar:loaded',
  CLOSET_LOADED:   'dripsync:closet:loaded',
  LOADOUT_LOADED:  'dripsync:loadout:loaded',

  // Loadout mutations
  WEARABLE_EQUIPPED:   'dripsync:wearable:equipped',
  WEARABLE_UNEQUIPPED: 'dripsync:wearable:unequipped',
  LOADOUT_UPDATED:     'dripsync:loadout:updated',
  EQUIP_FAILED:        'dripsync:equip:failed',
  UNEQUIP_FAILED:      'dripsync:unequip:failed',

  // Outfit presets
  OUTFIT_SAVED:              'dripsync:outfit:saved',
  OUTFIT_APPLIED:            'dripsync:outfit:applied',
  OUTFIT_APPLY_FAILED:       'dripsync:outfit:apply_failed',
  OUTFIT_ROLLBACK_COMPLETED: 'dripsync:outfit:rollback_completed',
  OUTFIT_ROLLBACK_FAILED:    'dripsync:outfit:rollback_failed',

  // Avatar runtime
  AVATAR_RUNTIME_ATTACHED: 'dripsync:avatar:runtime_attached',
  AVATAR_RUNTIME_READY:    'dripsync:avatar:runtime_ready',
  AVATAR_RUNTIME_FAILED:   'dripsync:avatar:runtime_failed',

  // Scene / world runtime
  SCENE_RUNTIME_ATTACHED: 'dripsync:scene:runtime_attached',
  REALM_LOAD_STARTED:     'dripsync:realm:load_started',
  REALM_LOADED:           'dripsync:realm:loaded',
  REALM_LOAD_FAILED:      'dripsync:realm:load_failed',
  SCENE_OBJECTS_UPDATED:  'dripsync:scene:objects_updated',

  // Movement + animation runtime
  RUNTIME_CONTROLS_ATTACHED:      'dripsync:runtime:controls_attached',
  MOVEMENT_UPDATED:                'dripsync:movement:updated',
  ANIMATION_CHANGED:               'dripsync:animation:changed',
  EMOTE_PLAYED:                    'dripsync:emote:played',
  RUNTIME_UPDATE_FAILED:           'dripsync:runtime:update_failed',

  // Wearable runtime binding
  WEARABLE_RUNTIME_ATTACHED:      'dripsync:wearable:runtime_attached',
  WEARABLE_RUNTIME_DETACHED:      'dripsync:wearable:runtime_detached',
  WEARABLE_RUNTIME_SYNC_COMPLETED:'dripsync:wearable:runtime_sync_completed',
  WEARABLE_RUNTIME_SYNC_FAILED:   'dripsync:wearable:runtime_sync_failed',

  // Commerce / Entitlements
  ENTITLEMENT_GRANT_STARTED: 'dripsync:entitlement:grant_started',
  ENTITLEMENT_GRANTED:       'dripsync:entitlement:granted',
  ENTITLEMENT_GRANT_PARTIAL: 'dripsync:entitlement:grant_partial',
  ENTITLEMENT_GRANT_FAILED:  'dripsync:entitlement:grant_failed',
  CLOSET_REFRESHED:          'dripsync:closet:refreshed',

  // State
  STATE_CHANGED:   'dripsync:state:changed',
  ERROR:           'dripsync:error',
});

export default DripSyncEvents;