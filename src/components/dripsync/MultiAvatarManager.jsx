import React, { useCallback, useState } from 'react';

/**
 * MultiAvatarManager
 * Handles multiple avatars in DripSync viewport
 * - Only selected avatar responds to controls
 * - Tracks individual avatar state (URL, customization)
 */
export function useMultiAvatarManager() {
  const [avatarInstances, setAvatarInstances] = React.useState([]);
  const [selectedInstanceId, setSelectedInstanceId] = React.useState(null);

  // Add avatar instance to scene
  const addAvatarInstance = useCallback((avatarUrl, customization = {}) => {
    const instanceId = `avatar-${Date.now()}`;

    setAvatarInstances(prev => [
      ...prev,
      {
        id: instanceId,
        url: avatarUrl,
        customization,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
      },
    ]);

    setSelectedInstanceId(instanceId);
    return instanceId;
  }, []);

  // Remove avatar instance from scene
  const removeAvatarInstance = useCallback((instanceId) => {
    setAvatarInstances(prev => prev.filter(a => a.id !== instanceId));

    // Clear selection if removed
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  }, [selectedInstanceId]);

  // Update selected avatar customization
  const updateSelectedAvatar = useCallback((updates) => {
    if (!selectedInstanceId) return;

    setAvatarInstances(prev =>
      prev.map(a =>
        a.id === selectedInstanceId
          ? { ...a, ...updates }
          : a
      )
    );
  }, [selectedInstanceId]);

  // Update selected avatar transform
  const updateSelectedTransform = useCallback((position, rotation, scale) => {
    if (!selectedInstanceId) return;

    setAvatarInstances(prev =>
      prev.map(a =>
        a.id === selectedInstanceId
          ? { ...a, position, rotation, scale }
          : a
      )
    );
  }, [selectedInstanceId]);

  // Get selected instance
  const selectedInstance = avatarInstances.find(a => a.id === selectedInstanceId);

  return {
    avatarInstances,
    selectedInstanceId,
    selectedInstance,
    addAvatarInstance,
    removeAvatarInstance,
    setSelectedInstanceId,
    updateSelectedAvatar,
    updateSelectedTransform,
  };
}

/**
 * Component to visualize and manage multiple avatars
 */
export default function MultiAvatarManager({
  instances = [],
  selectedInstanceId = null,
  onSelectInstance,
  onRemoveInstance,
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-100">Avatar Instances</h3>

      {instances.length === 0 ? (
        <p className="text-xs text-text-40">No avatars in scene</p>
      ) : (
        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
          {instances.map((instance) => (
            <div
              key={instance.id}
              onClick={() => onSelectInstance(instance.id)}
              className={`
                p-2 rounded text-xs cursor-pointer transition-all
                ${selectedInstanceId === instance.id
                  ? 'bg-skrt-cyan/20 border border-skrt-cyan text-skrt-cyan'
                  : 'bg-white/5 border border-white/10 text-text-60 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  Instance {instance.id.split('-')[1]?.slice(-4)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveInstance(instance.id);
                  }}
                  className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}