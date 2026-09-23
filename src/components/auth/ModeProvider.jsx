import React, { createContext, useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';

export const ModeContext = createContext(null);

export const MODES = {
  STANDARD: 'standard',
  EVENTS: 'events',
};

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(MODES.STANDARD);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeMode = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser && currentUser.modePreference) {
          setMode(currentUser.modePreference);
        } else {
          setMode(MODES.STANDARD);
        }
      } catch (err) {
        // Not logged in, use Standard mode
        setMode(MODES.STANDARD);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeMode();
  }, []);

  const switchMode = async (newMode) => {
    if (!user) return; // Only authenticated users can switch

    setMode(newMode);

    try {
      // Persist to user profile
      await base44.auth.updateMe({
        modePreference: newMode,
      });
    } catch (err) {
      console.error('Failed to save mode preference:', err);
      // Mode is still switched locally, even if persistence fails
    }
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        switchMode,
        user,
        isLoggedIn: !!user,
        loading,
        canSwitchMode: !!user, // Only logged-in users can switch
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
}