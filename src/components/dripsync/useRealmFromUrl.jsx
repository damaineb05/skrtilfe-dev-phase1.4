import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Reads ?realmId=<id> from the URL on mount, fetches the Realm,
 * and calls onRealmLoaded(realm, environment) so DripSync can apply it.
 */
export default function useRealmFromUrl({ setCurrentRealm, setEnvironment, setHardReloadToken, toast }) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const realmId = urlParams.get('realmId');
    if (!realmId) return;

    base44.entities.Realm.filter({ id: realmId })
      .then((results) => {
        const realm = results?.[0];
        if (!realm) {
          console.warn('Realm not found for id:', realmId);
          return;
        }

        setCurrentRealm(realm);

        if (realm.environment_url) {
          setEnvironment({
            id: realm.id,
            name: realm.name,
            url: realm.environment_url,
            metadata: realm,
          });
          setHardReloadToken(prev => prev + 1);
        }

        toast({
          title: `Entered ${realm.name}`,
          description: realm.description || 'Welcome to this world.',
          duration: 3000,
        });

        // Clean the URL so it doesn't re-trigger on re-render
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(err => console.error('Failed to load realm from URL:', err));
  }, []); // run once on mount
}