/**
 * Constants — Animation Presets
 * Named animation aliases and locomotion state definitions.
 */

export const LOCOMOTION_STATES = ['idle', 'walk', 'run', 'jump', 'backward', 'strafeleft', 'straferight'];

export const LOCOMOTION_KEY_MAP = {
  w: 'walk', forward: 'walk',
  s: 'backward', backward: 'backward',
  a: 'strafeLeft', strafeleft: 'strafeLeft',
  d: 'strafeRight', straferight: 'strafeRight',
  shift: 'run', run: 'run', sprint: 'run',
  space: 'jump', jump: 'jump', jumping: 'jump',
  idle: 'idle', rest: 'idle',
};

export const HIP_BONE_NAMES = ['Hips', 'mixamorig:Hips', 'Armature|Hips'];

export default { LOCOMOTION_STATES, LOCOMOTION_KEY_MAP, HIP_BONE_NAMES };