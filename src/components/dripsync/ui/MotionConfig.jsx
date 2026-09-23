/**
 * Shared motion presets for DripSync UI.
 * Use these constants everywhere for a consistent feel.
 */

export const PANEL_SLIDE_LEFT = {
  initial:    { opacity: 0, x: -16 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: -16 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

export const PANEL_SLIDE_RIGHT = {
  initial:    { opacity: 0, x: 16 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: 16 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

export const FADE_UP = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const SCALE_TAP = {
  whileHover: { scale: 1.03 },
  whileTap:   { scale: 0.97 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
};

export const SPRING_SLIDE_UP = {
  initial:    { y: '100%' },
  animate:    { y: 0 },
  exit:       { y: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 },
};

export const OVERLAY_FADE = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.15 },
};