import { createContext, useContext, useRef } from 'react';

/**
 * Context to pass avatar refs from viewport to controller
 * Allows MobileViewport to share its mesh/camera/state machine refs
 * with MobileAvatarController without prop drilling
 */
const MobileAvatarContext = createContext(null);

export function MobileAvatarProvider({ children }) {
  const avatarMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const stateMachineRef = useRef(null);

  return (
    <MobileAvatarContext.Provider
      value={{
        avatarMeshRef,
        cameraRef,
        stateMachineRef,
      }}
    >
      {children}
    </MobileAvatarContext.Provider>
  );
}

export function useMobileAvatarContext() {
  const context = useContext(MobileAvatarContext);
  if (!context) {
    throw new Error('useMobileAvatarContext must be used within MobileAvatarProvider');
  }
  return context;
}