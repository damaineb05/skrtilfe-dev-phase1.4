/**
 * useDripSyncOS — React hook that manages the OS world lifecycle.
 *
 * - Creates/disposes DripSyncOSWorld when the scene is ready
 * - Polls avatar position each frame to detect district proximity
 * - Exposes: nearbyDistrict, openDistrict, activeDistrict
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { DripSyncOSWorld } from './DripSyncOSWorld';

export function useDripSyncOS({ scene, THREE, modelRef, enabled = true }) {
  const worldRef = useRef(null);
  const [nearbyDistrict, setNearbyDistrict] = useState(null);
  const [activeDistrict, setActiveDistrict] = useState(null);
  const lastDistrictRef = useRef(null);

  // Build the OS world when scene is ready
  useEffect(() => {
    if (!scene || !THREE || !enabled) return;

    const world = new DripSyncOSWorld(THREE, scene);
    worldRef.current = world;

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, [scene, THREE, enabled]);

  // Per-frame update — called from the animation loop via ref
  const update = useCallback((delta) => {
    const world = worldRef.current;
    if (!world) return;

    world.update(delta);

    // Check avatar proximity
    const model = modelRef?.current;
    if (!model) return;

    const pos = model.position;
    const district = world.getDistrictAtPosition(pos);

    if (district?.id !== lastDistrictRef.current) {
      lastDistrictRef.current = district?.id || null;
      setNearbyDistrict(district || null);
      if (district) world.highlightDistrict(district.id);
      else world.clearHighlight();
    }
  }, [modelRef]);

  const openDistrict = useCallback((districtId) => {
    setActiveDistrict(districtId);
  }, []);

  const closeDistrict = useCallback(() => {
    setActiveDistrict(null);
  }, []);

  return { nearbyDistrict, activeDistrict, openDistrict, closeDistrict, update, worldRef };
}