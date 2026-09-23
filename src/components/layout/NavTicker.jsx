import React from 'react';

const TICKER_ITEMS = [
  { text: 'SKRTLIFE Digital Society', color: '#00D4FF' },
  { text: 'Genesis Pass — Lifetime Access', color: '#FFD700' },
  { text: 'New Drops Every Season', color: '#FF3366' },
  { text: 'DripSync Avatar Studio', color: '#00D4FF' },
  { text: 'Digital Native Community', color: '#FF3366' },
  { text: 'Limited Edition Releases', color: '#FFD700' },
];

export default function NavTicker() {
  return (
    <div style={{
      overflow: 'hidden', height: 28, display: 'flex', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', gap: 60, whiteSpace: 'nowrap',
        animation: 'ticker-scroll 30s linear infinite',
      }}>
        {[0, 1].map((repeat) => (
          <React.Fragment key={repeat}>
            {TICKER_ITEMS.map((item, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                {item.text}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
      <style>{`@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}