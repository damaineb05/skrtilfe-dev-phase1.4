import * as THREE from 'three';

/**
 * WorldGrid — placement / environment grid for SKRTLIFE WORLD.
 *
 * Adapted from the reference repo's useGrid hook (vector3 ↔ grid-cell
 * conversion bound to a room map). SKRTLIFE decouples it from any room/map
 * atom: it is a pure utility any zone can instantiate, so world objects
 * (props, products, furniture, future build-mode placements) snap to a
 * repeatable grid without hard-coding positions across components.
 *
 * Extension point for the future build / placement mode.
 */
export default class WorldGrid {
  constructor({ cell = 1, origin = new THREE.Vector3(0, 0, 0) } = {}) {
    this.cell = cell;
    this.origin = origin.clone();
  }

  /** World position -> [gx, gz] grid cell (floor). */
  toGrid(v) {
    return [
      Math.floor((v.x - this.origin.x) / this.cell),
      Math.floor((v.z - this.origin.z) / this.cell),
    ];
  }

  /** Grid cell -> centered world Vector3 (y preserved from origin). */
  toWorld(gx, gz, y = this.origin.y) {
    return new THREE.Vector3(
      this.origin.x + (gx + 0.5) * this.cell,
      y,
      this.origin.z + (gz + 0.5) * this.cell,
    );
  }
}