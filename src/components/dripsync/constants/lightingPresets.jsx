/**
 * Constants — Lighting Presets
 * All LIGHTING_PRESETS data extracted from DripSyncViewport.
 * Import this in viewport or any lighting control component.
 */
import {
  Lightbulb, Sun, Moon, Zap, Sparkles,
} from 'lucide-react';

export const LIGHTING_PRESETS = {
  studio: {
    name: 'Studio', icon: Lightbulb,
    ambient: { color: 0xffffff, intensity: 1.3 },
    key:     { color: 0xffffff, intensity: 1.2, position: [5, 10, 7] },
    fill:    { color: 0x00ffff, intensity: 0.4, position: [-5, 3, -5] },
    rim:     { color: 0xffffff, intensity: 0.8, position: [0, 3, -8] },
    accent1: { color: 0x00ffff, intensity: 0.5, position: [3, 2, 3] },
    accent2: { color: 0xff00ff, intensity: 0.5, position: [-3, 2, -3] },
    hemi:    { skyColor: 0xffffff, groundColor: 0x444444, intensity: 0.4 },
    fog:     { enabled: true, near: 10, far: 50 },
  },
  outdoor: {
    name: 'Outdoor', icon: Sun,
    ambient: { color: 0xffffee, intensity: 1.3 },
    key:     { color: 0xffffdd, intensity: 1.5, position: [10, 15, 5] },
    fill:    { color: 0xaaccff, intensity: 0.3, position: [-8, 5, -3] },
    rim:     { color: 0xffffff, intensity: 0.5, position: [0, 5, -10] },
    accent1: { color: 0xffeeaa, intensity: 0.3, position: [5, 3, 5] },
    accent2: { color: 0xaaddff, intensity: 0.3, position: [-5, 3, -5] },
    hemi:    { skyColor: 0x87ceeb, groundColor: 0x8b7355, intensity: 0.6 },
    fog:     { enabled: false },
  },
  neon: {
    name: 'Neon', icon: Zap,
    ambient: { color: 0x110033, intensity: 1.3 },
    key:     { color: 0xff00ff, intensity: 0.8, position: [5, 8, 7] },
    fill:    { color: 0x00ffff, intensity: 0.6, position: [-5, 3, -5] },
    rim:     { color: 0xff0088, intensity: 1.0, position: [0, 3, -8] },
    accent1: { color: 0xff00ff, intensity: 0.8, position: [3, 2, 3] },
    accent2: { color: 0x00ffff, intensity: 0.8, position: [-3, 2, -3] },
    hemi:    { skyColor: 0x2200ff, groundColor: 0x220044, intensity: 0.3 },
    fog:     { enabled: true, near: 5, far: 30 },
  },
  cinematic: {
    name: 'Cinematic', icon: Sparkles,
    ambient: { color: 0xffffff, intensity: 1.3 },
    key:     { color: 0xffddaa, intensity: 1.8, position: [8, 12, 5] },
    fill:    { color: 0x6688ff, intensity: 0.2, position: [-6, 2, -6] },
    rim:     { color: 0xffffff, intensity: 1.2, position: [-2, 4, -10] },
    accent1: { color: 0xff8844, intensity: 0.4, position: [4, 1, 4] },
    accent2: { color: 0x4466ff, intensity: 0.4, position: [-4, 1, -4] },
    hemi:    { skyColor: 0xffffee, groundColor: 0x332211, intensity: 0.3 },
    fog:     { enabled: true, near: 15, far: 60 },
  },
  night: {
    name: 'Night', icon: Moon,
    ambient: { color: 0x223355, intensity: 1.3 },
    key:     { color: 0xaaccff, intensity: 0.8, position: [5, 10, 7] },
    fill:    { color: 0x4455aa, intensity: 0.3, position: [-5, 3, -5] },
    rim:     { color: 0x8899ff, intensity: 0.6, position: [0, 3, -8] },
    accent1: { color: 0x6688ff, intensity: 0.4, position: [3, 2, 3] },
    accent2: { color: 0x4466aa, intensity: 0.4, position: [-3, 2, -3] },
    hemi:    { skyColor: 0x334466, groundColor: 0x111122, intensity: 0.5 },
    fog:     { enabled: true, near: 8, far: 40 },
  },
};

export default LIGHTING_PRESETS;