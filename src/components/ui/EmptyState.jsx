import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Shared empty state component — glass/cyberpunk branded.
 * Props:
 *   icon: React element (e.g. <ShoppingBag />)
 *   eyebrow: small label above headline (optional)
 *   title: main headline
 *   description: short human explanation
 *   cta: { label, href, onClick } — primary action
 *   secondaryCta: { label, href, onClick } — optional secondary
 *   accentColor: hex color for glow accent (default #00D4FF)
 */
export default function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  cta,
  secondaryCta,
  accentColor = '#00D4FF',
}) {
  const glow = `${accentColor}22`;
  const border = `${accentColor}28`;

  const CtaButton = ({ action, primary }) => {
    const base = `inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all rounded-lg`;
    const style = primary
      ? { background: `${accentColor}18`, border: `1px solid ${accentColor}55`, color: accentColor }
      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' };

    if (action.href) {
      return (
        <Link to={action.href}>
          <button className={base} style={style}>{action.label}</button>
        </Link>
      );
    }
    return (
      <button className={base} style={style} onClick={action.onClick}>
        {action.label}
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-12 px-6"
      style={{
        borderRadius: '16px',
        background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 70%)`,
        border: `1px solid ${border}`,
      }}
    >
      {/* Icon ring */}
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 0 24px ${accentColor}18`,
          }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      )}

      {/* Eyebrow */}
      {eyebrow && (
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] mb-2"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          {eyebrow}
        </p>
      )}

      {/* Headline */}
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-xs leading-relaxed mb-6 max-w-[240px]"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          {description}
        </p>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {cta && <CtaButton action={cta} primary />}
        {secondaryCta && <CtaButton action={secondaryCta} />}
      </div>
    </motion.div>
  );
}