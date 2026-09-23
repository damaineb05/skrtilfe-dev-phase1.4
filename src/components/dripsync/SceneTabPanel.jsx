/**
 * SceneTabPanel
 * Extracted from pages/DripSync.jsx to reduce file size.
 * Renders the Scene tab content: social room, multiplayer, sketchfab, interactive objects, scene objects.
 */
import React from 'react';
import SocialRoomPanel from './SocialRoomPanel';
import MultiplayerPanel from '../multiplayer/MultiplayerPanel';
import SketchfabBrowser from './SketchfabBrowser';
import InteractiveObjectsPanel from './InteractiveObjectsPanel';
import SceneObjectsPanel from './SceneObjectsPanel';

export default function SceneTabPanel({
  isInSocialRoom, socialRoomCode, socialParticipants, createSocialRoom, joinSocialRoom, leaveSocialRoom, user,
  multiplayerConnected, multiplayerRoom, multiplayerPlayers, handleCreateRoom, handleJoinRoom, handleLeaveRoom,
  interactiveObjects, setInteractiveObjects, selectedObjectId, setSelectedObjectId,
  sceneAvatars, setSceneAvatars, sceneFurniture, setSceneFurniture,
}) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Social Room</h3>
        <SocialRoomPanel
          isInRoom={isInSocialRoom}
          roomCode={socialRoomCode}
          participants={socialParticipants}
          onCreateRoom={createSocialRoom}
          onJoinRoom={joinSocialRoom}
          onLeaveRoom={leaveSocialRoom}
          currentUser={user}
        />
      </div>
      <div>
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Multiplayer</h3>
        <MultiplayerPanel
          connected={multiplayerConnected}
          room={multiplayerRoom}
          players={multiplayerPlayers}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onLeaveRoom={handleLeaveRoom}
          currentUser={user}
        />
      </div>
      <div>
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Sketchfab Assets</h3>
        <SketchfabBrowser onAddObject={(obj) => setInteractiveObjects(prev => [...prev, obj])} />
      </div>
      <div>
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Interactive Objects</h3>
        <InteractiveObjectsPanel
          objects={interactiveObjects}
          onAdd={(obj) => setInteractiveObjects(prev => [...prev, obj])}
          onUpdate={(id, patch) => setInteractiveObjects(prev => prev.map(o => o.id === id ? {...o, ...patch} : o))}
          onRemove={(id) => setInteractiveObjects(prev => prev.filter(o => o.id !== id))}
          selectedId={selectedObjectId}
          onSelect={setSelectedObjectId}
        />
      </div>
      <div>
        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">Scene Objects</h3>
        <SceneObjectsPanel
          avatars={sceneAvatars}
          furniture={sceneFurniture}
          onAddAvatar={(av) => setSceneAvatars(prev => [...prev, av])}
          onUpdateAvatar={(id, patch) => setSceneAvatars(prev => prev.map(a => a.id === id ? {...a, ...patch} : a))}
          onRemoveAvatar={(id) => setSceneAvatars(prev => prev.filter(a => a.id !== id))}
          onAddFurniture={(fu) => setSceneFurniture(prev => [...prev, fu])}
          onUpdateFurniture={(id, patch) => setSceneFurniture(prev => prev.map(f => f.id === id ? {...f, ...patch} : f))}
          onRemoveFurniture={(id) => setSceneFurniture(prev => prev.filter(f => f.id !== id))}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
        />
      </div>
    </div>
  );
}