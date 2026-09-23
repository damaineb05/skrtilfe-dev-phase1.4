// SKRTLIFE Brand Theme Configuration
// Inspired by: ATV culture, urban streets, cyberpunk tech, rebel attitude

export const THEME = {
  // Core Brand Colors
  colors: {
    // Primary palette - extracted from brand photos
    primary: '#00D4FF',      // Cyan neon - tech/cyber accent
    secondary: '#FF3366',    // Hot pink/red - rebel energy
    accent: '#FFD700',       // Gold/yellow - from logo dots
    
    // Neutral tones
    black: '#0A0A0F',        // Deep black with slight blue
    darkGray: '#1A1A2E',     // Dark purple-black
    midGray: '#2D2D44',      // Mid tone for cards
    lightGray: '#4A4A6A',    // Lighter accents
    
    // Background gradients
    bgPrimary: '#0A0A0F',
    bgSecondary: '#12121C',
    bgTertiary: '#1A1A2E',
    
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.4)',
    
    // Status/accent colors
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF4444',
    info: '#00D4FF',
    
    // Special effects
    neonCyan: '#00D4FF',
    neonPink: '#FF3366',
    neonPurple: '#8B5CF6',
    neonGreen: '#00FF88',
    
    // Logo dot colors (from SKRTLIFE branding)
    dotRed: '#FF3366',
    dotBlue: '#00D4FF',
    dotYellow: '#FFD700',
    dotGreen: '#00FF88',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
    secondary: 'linear-gradient(135deg, #FF3366 0%, #FF6B35 100%)',
    dark: 'linear-gradient(180deg, #0A0A0F 0%, #1A1A2E 100%)',
    cyber: 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #2D1B4E 100%)',
    hero: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)',
    card: 'linear-gradient(145deg, rgba(26,26,46,0.9) 0%, rgba(10,10,15,0.95) 100%)',
    glow: 'radial-gradient(circle at center, rgba(0,212,255,0.15) 0%, transparent 70%)',
  },
  
  // Shadows with neon glow effects
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    neonCyan: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
    neonPink: '0 0 20px rgba(255, 51, 102, 0.4), 0 0 40px rgba(255, 51, 102, 0.2)',
    neonPurple: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
    card: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  
  // Border styles
  borders: {
    subtle: '1px solid rgba(255, 255, 255, 0.08)',
    light: '1px solid rgba(255, 255, 255, 0.12)',
    accent: '1px solid rgba(0, 212, 255, 0.3)',
    glow: '1px solid rgba(0, 212, 255, 0.5)',
  },
  
  // Glass/frosted effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    dark: 'rgba(0, 0, 0, 0.4)',
    blur: 'blur(20px)',
  },
  
  // Typography
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    brand: "'Harvest Ital', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  
  // Border radius
  radius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
    spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
    toast: 500,
  },
};

// CSS Variables string for injection
export const CSS_VARIABLES = `
  :root {
    /* Core Colors */
    --color-primary: ${THEME.colors.primary};
    --color-secondary: ${THEME.colors.secondary};
    --color-accent: ${THEME.colors.accent};
    
    /* Backgrounds */
    --bg-primary: ${THEME.colors.bgPrimary};
    --bg-secondary: ${THEME.colors.bgSecondary};
    --bg-tertiary: ${THEME.colors.bgTertiary};
    
    /* Text */
    --text-primary: ${THEME.colors.textPrimary};
    --text-secondary: ${THEME.colors.textSecondary};
    --text-muted: ${THEME.colors.textMuted};
    
    /* Neons */
    --neon-cyan: ${THEME.colors.neonCyan};
    --neon-pink: ${THEME.colors.neonPink};
    --neon-purple: ${THEME.colors.neonPurple};
    --neon-green: ${THEME.colors.neonGreen};
    
    /* Logo Dots */
    --dot-red: ${THEME.colors.dotRed};
    --dot-blue: ${THEME.colors.dotBlue};
    --dot-yellow: ${THEME.colors.dotYellow};
    --dot-green: ${THEME.colors.dotGreen};
    
    /* Shadows */
    --shadow-neon-cyan: ${THEME.shadows.neonCyan};
    --shadow-neon-pink: ${THEME.shadows.neonPink};
    
    /* Glass */
    --glass-light: ${THEME.glass.light};
    --glass-medium: ${THEME.glass.medium};
  }
`;

export default THEME;