import { useEffect } from 'react';

/**
 * Initialize viewport with default environment on load
 * Ensures environment is set and prevents auto zoom-out bugs
 */
export function useViewportEnvironmentInit(
  environment,
  onEnvironmentLoaded,
  defaultEnvironment = null
) {
  useEffect(() => {
    // If environment is provided, notify parent that it's loaded
    if (environment) {
      if (onEnvironmentLoaded) {
        onEnvironmentLoaded(environment);
      }
    } else if (defaultEnvironment && onEnvironmentLoaded) {
      // Use default if none provided
      onEnvironmentLoaded(defaultEnvironment);
    }
  }, [environment, onEnvironmentLoaded, defaultEnvironment]);

  return {
    activeEnvironment: environment || defaultEnvironment,
  };
}