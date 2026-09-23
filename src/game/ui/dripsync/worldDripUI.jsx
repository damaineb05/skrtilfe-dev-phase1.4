import React from 'react';
import { Shirt } from 'lucide-react';

export function Chip({ children }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 999,
      background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.9)',
    }}>{children}</span>
  );
}

export function Panel({ icon: Icon, title, children, right }) {
  return (
    <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={13} color="rgba(0,212,255,0.8)" />}
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{title}</span>
        </div>
        {right}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

export function Empty({ title, body, inline }) {
  const inner = (
    <>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{title}</div>
      {body && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.5 }}>{body}</div>}
    </>
  );
  if (inline) return <div style={{ padding: '4px 2px' }}>{inner}</div>;
  return (
    <div style={{ textAlign: 'center', padding: '22px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
      {inner}
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '22px', color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      <span className="animate-spin" style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#00D4FF', display: 'inline-block' }} />
      {label}
    </div>
  );
}

export function Thumb({ url, big }) {
  const base = { borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const size = big ? { width: '100%', aspectRatio: '1 / 1' } : { width: 44, height: 44, flexShrink: 0 };
  return (
    <div style={{ ...base, ...size }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Shirt size={16} color="rgba(255,255,255,0.2)" />}
    </div>
  );
}

export function ActionBtn({ label, onClick, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? '5px 10px' : '7px 12px', borderRadius: 8,
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: '0.04em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? 'rgba(255,255,255,0.3)' : '#070709',
      background: disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#00D4FF,#a855f7)',
      border: 'none',
    }}>{label}</button>
  );
}