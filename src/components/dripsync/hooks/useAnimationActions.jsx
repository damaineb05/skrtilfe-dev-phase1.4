/**
 * Hook — useAnimationActions
 * Encapsulates animation preview, apply, cancel, and emote triggering.
 * Consumed by DripSync page.
 */
import { useCallback, useRef } from 'react';

export function useAnimationActions({ setPreviewAnimUrl, setStateMachineState }) {
  const stateMachineRef = useRef(null);

  const handleStateMachineInit = useCallback((sm) => {
    stateMachineRef.current = sm;
    setStateMachineState(sm.getState());
  }, [setStateMachineState]);

  const handlePreviewAnimation = useCallback((anim) => {
    const url = anim?.url || null;
    const name = anim?.slug || anim?.name || (typeof anim === 'string' ? anim : null);
    if (url?.startsWith('http')) {
      setPreviewAnimUrl(url + '#p' + Date.now());
    } else if (stateMachineRef.current && name) {
      stateMachineRef.current.preview(name);
      setStateMachineState(stateMachineRef.current.getState());
    }
  }, [setPreviewAnimUrl, setStateMachineState]);

  const handleApplyAnimation = useCallback((anim) => {
    const url = anim?.url || null;
    const name = anim?.slug || anim?.name || (typeof anim === 'string' ? anim : null);
    if (url?.startsWith('http')) {
      setPreviewAnimUrl(url + '#a' + Date.now());
    } else if (stateMachineRef.current) {
      if (stateMachineRef.current.isPreviewing()) {
        stateMachineRef.current.applyPreview();
      } else if (name) {
        stateMachineRef.current.transitionTo(name, { force: true });
      }
      setStateMachineState(stateMachineRef.current.getState());
    }
  }, [setPreviewAnimUrl, setStateMachineState]);

  const handleCancelPreview = useCallback(() => {
    if (stateMachineRef.current) {
      stateMachineRef.current.cancelPreview();
      setStateMachineState(stateMachineRef.current.getState());
    }
  }, [setStateMachineState]);

  return {
    stateMachineRef,
    handleStateMachineInit,
    handlePreviewAnimation,
    handleApplyAnimation,
    handleCancelPreview,
  };
}

export default useAnimationActions;