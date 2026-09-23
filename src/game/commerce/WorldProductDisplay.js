import * as THREE from 'three';
import { base44 } from '@/api/base44Client';

/**
 * WorldProductDisplay — the commerce connection between the 3D world and the
 * existing SKRTLIFE product database.
 *
 * The website / store remains the single source of truth (per the directive:
 * "Do NOT create a second commerce database inside the 3D world"). This
 * system only READS a Product record and surfaces it inside the 3D storefront.
 *
 * Flow:
 *   SKRTLIFE PRODUCT DATABASE  →  WorldProductDisplay (this)
 *                             →  3D DISPLAY (pedestal holo-card + rotating image)
 *                             →  VIEW / PURCHASE  (StoreOverlay → existing site)
 *
 * It never writes commerce data. Purchasing/try-on happens on the existing
 * SKRTLIFE site, reached from the in-world StoreOverlay.
 */
export default class WorldProductDisplay {
  constructor({ scene, anchor = new THREE.Vector3(0, 0, 14) }) {
    this.scene = scene;
    this.anchor = anchor.clone();
    this.group = new THREE.Group();
    scene.add(this.group);
    this.product = null;
    this._tex = null;
    this._card = null;
    this._halo = null;
    this._build();
  }

  _build() {
    // floating holo-frame where the featured product image appears
    this._card = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    this._card.position.copy(this.anchor).add(new THREE.Vector3(0, 2.7, 0));
    this.group.add(this._card);

    // soft rotating halo ring on the ground marking the display
    this._halo = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.5, 40),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    this._halo.rotation.x = -Math.PI / 2;
    this._halo.position.copy(this.anchor).add(new THREE.Vector3(0, 0.14, 0));
    this.group.add(this._halo);
  }

  _primaryImage(product) {
    const media = product.media || [];
    const primary = media.find((m) => m.is_primary && m.type !== '3d')
      || media.find((m) => m.type !== '3d');
    return primary?.url || product.og_image || null;
  }

  /** Pull the featured (or first active) Product record from the existing DB. */
  async loadFeatured() {
    try {
      let list = await base44.entities.Product.filter(
        { status: 'active', is_featured: true }, '-created_date', 3,
      );
      if (!list.length) list = await base44.entities.Product.filter({ status: 'active' }, '-created_date', 3);
      const product = list[0] || null;
      if (product) this.setProduct(product);
      return product;
    } catch (e) {
      console.warn('[WorldProductDisplay] product load failed', e);
      return null;
    }
  }

  setProduct(product) {
    this.product = product;
    const url = this._primaryImage(product);
    if (!url) return;
    new THREE.TextureLoader().load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      this._tex = tex;
      this._card.material.map = tex;
      this._card.material.opacity = 1;
      this._card.material.needsUpdate = true;
    });
  }

  update(dt) {
    if (this._card) this._card.rotation.y += dt * 0.4;
    if (this._halo) this._halo.rotation.z += dt * 0.2;
  }

  dispose() {
    this.scene.remove(this.group);
    this._tex?.dispose?.();
  }
}