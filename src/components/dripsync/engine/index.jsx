/**
 * DripSync Engine — public surface.
 *
 * Import from here, not from individual module files:
 *   import { DripSyncEngine, ENGINE_EVENTS } from '@/components/dripsync/engine';
 */

export { DripSyncEngine, default }  from './DripSyncEngine';
export { EngineEvents, ENGINE_EVENTS } from './events/EngineEvents';
export { DripSyncStore }            from './store/DripSyncStore';
export { AvatarModule }             from './modules/AvatarModule';
export { WearableModule }           from './modules/WearableModule';
export { AnimationModule }          from './modules/AnimationModule';
export { EnvironmentModule }        from './modules/EnvironmentModule';