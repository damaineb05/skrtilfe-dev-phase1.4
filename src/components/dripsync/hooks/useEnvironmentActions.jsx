/**
 * Hook — useEnvironmentActions
 * Encapsulates scene/environment add, load, remove operations.
 * Consumed by DripSync page.
 */
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useEnvironmentActions({ environment, setEnvironment, setSceneLibrary, setHardReloadToken, toast: toastProp }) {
  const { toast: toastHook } = useToast();
  const toast = toastProp || toastHook;

  const handleAddEnvironment = useCallback((env) => {
    const s = { ...env, uploadedAt: new Date().toISOString(), id: env.id || Date.now() };
    setEnvironment(s);
    setSceneLibrary(prev => prev.find(e => e.url === env.url) ? prev : [...prev, s]);
    setHardReloadToken(p => p + 1);
    toast({ title: 'Scene loaded', description: `${env.name} added to library.`, duration: 200 });
  }, [setEnvironment, setSceneLibrary, setHardReloadToken, toast]);

  const handleLoadSceneFromLibrary = useCallback((scene) => {
    setEnvironment(scene);
    setHardReloadToken(p => p + 1);
    toast({ title: 'Scene loaded', description: `${scene.name} is now active.`, duration: 200 });
  }, [setEnvironment, setHardReloadToken, toast]);

  const handleRemoveSceneFromLibrary = useCallback((sceneId) => {
    setSceneLibrary(prev => prev.filter(s => s.id !== sceneId));
    if (environment?.id === sceneId) {
      setEnvironment(null);
      setHardReloadToken(p => p + 1);
    }
    toast({ title: 'Scene removed', duration: 200 });
  }, [environment, setEnvironment, setSceneLibrary, setHardReloadToken, toast]);

  const handleRemoveEnvironment = useCallback(() => {
    setEnvironment(null);
    setHardReloadToken(p => p + 1);
    toast({ title: 'Environment removed', duration: 200 });
  }, [setEnvironment, setHardReloadToken, toast]);

  return {
    handleAddEnvironment,
    handleLoadSceneFromLibrary,
    handleRemoveSceneFromLibrary,
    handleRemoveEnvironment,
  };
}

export default useEnvironmentActions;