import React, { createContext, useState, useCallback, useContext } from 'react';
import { requireAuth as performAuthCheck } from './authGatingUtils';
import AuthGateModal from './AuthGateModal';

export const AuthGateContext = createContext(null);

export function AuthGateProvider({ children }) {
  const [gateState, setGateState] = useState({
    isOpen: false,
    reason: '',
    pendingAction: null,
  });

  const openGate = useCallback((reason, pendingAction) => {
    setGateState({
      isOpen: true,
      reason,
      pendingAction,
    });
  }, []);

  const closeGate = useCallback(() => {
    setGateState({
      isOpen: false,
      reason: '',
      pendingAction: null,
    });
  }, []);

  const executeAction = useCallback(() => {
    if (gateState.pendingAction) {
      gateState.pendingAction();
    }
    closeGate();
  }, [gateState.pendingAction, closeGate]);

  const requireAuth = useCallback((actionFn, reason) => {
    performAuthCheck(actionFn, reason, openGate);
  }, [openGate]);

  return (
    <AuthGateContext.Provider value={{ requireAuth, openGate, closeGate }}>
      {children}
      <AuthGateModal
        isOpen={gateState.isOpen}
        reason={gateState.reason}
        onClose={closeGate}
        onAfterAuth={executeAction}
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error('useAuthGate must be used within AuthGateProvider');
  }
  return context;
}