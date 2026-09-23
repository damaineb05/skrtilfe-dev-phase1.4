import React from 'react';
import SkrtWorld from '@/game/SkrtWorld';

/**
 * /world — full-screen SKRTLIFE WORLD entry. Rendered OUTSIDE the app layout
 * (no nav/footer) so the Three.js viewport owns the entire screen. Auth and
 * identity come from the same authenticated SKRTLIFE session as everywhere
 * else — there is no separate game login.
 */
export default function World() {
  return <SkrtWorld />;
}