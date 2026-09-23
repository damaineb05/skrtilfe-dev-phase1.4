import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Check, Coins, Tag } from 'lucide-react';

/**
 * StoreOverlay — the SKRTLIFE storefront interaction surface, opened from the
 * 3D world by the ENTER_STORE interaction. Renders the SAME Product record the
 * 3D pedestal is showing (passed in from WorldProductDisplay, sourced from the
 * existing SKRTLIFE product DB).
 *
 * The website remains source of truth:
 *   - "View on SKRTLIFE" bridges to the existing /ProductDetail page (real
 *     commerce, cart, checkout — not a second store).
 *   - "Claim Drop" completes the world mission (reward into the existing wallet).
 *   - "Back to World" returns to the 3D world without leaving the page.
 */
export default function StoreOverlay({ open, product, zoneLabel: zoneLabelProp, showClaim = true, missionDone, onClaim, onViewOnSite, onClose }) {
  const img = product?.media?.find((m) => m.is_primary && m.type !== '3d')?.url
    || product?.media?.find((m) => m.type !== '3d')?.url
    || product?.og_image;
  const isFiveLines = zoneLabelProp === 'Five Lines';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,7,9,0.8)', backdropFilter: 'blur(14px)', padding: 16 }}
        >
          <motion.div
            initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ width: 'min(920px, 94vw)', maxHeight: '88vh', overflow: 'auto', borderRadius: 18, background: 'rgba(12,12,20,0.94)', border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 24px 90px rgba(0,0,0,0.7)' }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#FF3366)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={14} color="#070709" />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: isFiveLines ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.45)' }}>{isFiveLines ? 'Five Lines' : 'SKRTLIFE Store'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{isFiveLines ? 'Premium Division · Limited' : 'Flagship · Featured Drop'}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                <ArrowLeft size={14} /> Back to World
              </button>
            </div>

            {/* body */}
            <div className="store-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0 }}>
              {/* product image */}
              <div style={{ minHeight: 240, background: 'radial-gradient(circle at 50% 40%, rgba(0,212,255,0.10), rgba(7,7,9,0))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                {img ? (
                  <img src={img} alt={product?.title} style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }} />
                ) : (
                  <div style={{ width: 220, height: 220, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{product?.title || 'Featured drop'}</div>
                )}
              </div>
              {/* details */}
              <div style={{ padding: 22 }}>
                {product?.collection && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00D4FF', padding: '4px 8px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', marginBottom: 10 }}>
                    <Tag size={10} /> {product.collection}
                  </span>
                )}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '4px 0 6px', letterSpacing: '-0.02em' }}>{product?.title || 'Featured Drop'}</h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>${(product?.price ?? 0).toFixed(2)}</span>
                  {product?.compare_at_price > product?.price && (
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>${product.compare_at_price.toFixed(2)}</span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 16px' }}>
                  {(product?.description || 'A limited-run SKRTLIFE piece. Claim the world drop, then head to the site for the full product, sizing, and checkout.').slice(0, 180)}
                </p>

                {/* actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {showClaim !== false && (
                    <button
                      onClick={onClaim}
                      disabled={missionDone}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '12px 14px', borderRadius: 10, border: 'none', cursor: missionDone ? 'default' : 'pointer',
                        fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: missionDone ? 'rgba(0,212,255,0.12)' : 'linear-gradient(135deg,#00D4FF,#0bb8e6)',
                        color: missionDone ? '#00D4FF' : '#070709',
                      }}
                    >
                      {missionDone ? <><Check size={14} /> Drop Claimed</> : <><Coins size={14} /> Claim World Drop · +500 SKRT</>}
                    </button>
                  )}
                  <button
                    onClick={onViewOnSite}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                  >
                    {isFiveLines ? 'View on SKRTLIFE →' : 'View on SKRTLIFE →'}
                  </button>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 12, textAlign: 'center' }}>
                  The SKRTLIFE store is the source of truth — purchase & checkout happen on the site.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}