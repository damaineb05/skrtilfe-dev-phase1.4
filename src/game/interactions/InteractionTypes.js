/**
 * InteractionTypes — the reusable, named interaction vocabulary for SKRTLIFE
 * WORLD. Interaction zones (WorldManager) carry a `type` from this catalog; the
 * shell (SkrtWorld) registers one handler per type. Adding a new interaction is
 * a data + handler change, not an engine change.
 *
 * Phase F active: ENTER_STORE, OPEN_DRIPSYNC, ENTER_EVENT, OPEN_DIRECTORY,
 * ENTER_VEHICLE, INSPECT_VEHICLE, TALK_TO_NPC.
 */
export const InteractionType = {
  ENTER_STORE: 'ENTER_STORE',
  VIEW_PRODUCT: 'VIEW_PRODUCT',
  TRY_ON_ITEM: 'TRY_ON_ITEM',
  OPEN_DRIPSYNC: 'OPEN_DRIPSYNC',
  OPEN_DIRECTORY: 'OPEN_DIRECTORY',
  TALK_TO_NPC: 'TALK_TO_NPC',
  ENTER_BUILDING: 'ENTER_BUILDING',
  ENTER_EVENT: 'ENTER_EVENT',
  START_MISSION: 'START_MISSION',
  ENTER_VEHICLE: 'ENTER_VEHICLE',
  INSPECT_VEHICLE: 'INSPECT_VEHICLE',
};

export const INTERACTION_META = {
  ENTER_STORE: { label: 'Enter Store', promptKey: 'E' },
  VIEW_PRODUCT: { label: 'View Product', promptKey: 'E' },
  TRY_ON_ITEM: { label: 'Try On', promptKey: 'E' },
  OPEN_DRIPSYNC: { label: 'Open DripSync', promptKey: 'E' },
  OPEN_DIRECTORY: { label: 'Directory', promptKey: 'E' },
  TALK_TO_NPC: { label: 'Talk', promptKey: 'E' },
  ENTER_BUILDING: { label: 'Enter Building', promptKey: 'E' },
  ENTER_EVENT: { label: 'Join Event', promptKey: 'E' },
  START_MISSION: { label: 'Start Mission', promptKey: 'E' },
  ENTER_VEHICLE: { label: 'Enter Vehicle', promptKey: 'F' },
  INSPECT_VEHICLE: { label: 'Inspect', promptKey: 'E' },
};

/** Types wired to a handler in Phase F. */
export const ACTIVE_TYPES = new Set([
  InteractionType.ENTER_STORE,
  InteractionType.OPEN_DRIPSYNC,
  InteractionType.OPEN_DIRECTORY,
  InteractionType.ENTER_EVENT,
  InteractionType.TALK_TO_NPC,
  InteractionType.ENTER_VEHICLE,
  InteractionType.INSPECT_VEHICLE,
]);

/** Human label for a zone, falling back to its type meta. */
export function zoneLabel(zone) {
  if (!zone) return null;
  if (zone.label) return zone.label;
  return INTERACTION_META[zone.type]?.label || zone.type;
}