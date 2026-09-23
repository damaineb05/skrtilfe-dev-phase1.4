import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Armchair, Layers, Trash2, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SceneObjectsPanel({ 
  avatars, 
  furniture, 
  onAddAvatar,
  onUpdateAvatar,
  onRemoveAvatar,
  onAddFurniture,
  onUpdateFurniture,
  onRemoveFurniture,
  selectedObjectId,
  onSelectObject
}) {
  const [activeTab, setActiveTab] = useState('avatars');

  const handleDuplicateAvatar = (avatar) => {
    const duplicated = {
      ...avatar,
      id: `av-${Date.now()}`,
      name: `${avatar.name} (Copy)`,
      position: [avatar.position[0] + 1, 0, avatar.position[2] + 1]
    };
    onAddAvatar(duplicated);
  };

  const handleDuplicateFurniture = (item) => {
    const duplicated = {
      ...item,
      id: `fu-${Date.now()}`,
      name: `${item.name} (Copy)`,
      position: [item.position[0] + 1, 0, item.position[2] + 1]
    };
    onAddFurniture(duplicated);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-cyan-400 uppercase tracking-wider">Scene Objects</h3>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 m-2">
          <TabsTrigger value="avatars" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Users className="w-4 h-4 mr-2" />
            Avatars ({avatars.length})
          </TabsTrigger>
          <TabsTrigger value="furniture" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Armchair className="w-4 h-4 mr-2" />
            Props ({furniture.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="avatars" className="h-full p-4 overflow-y-auto m-0">
            <div className="space-y-3">
              {avatars.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No avatars in scene</p>
                  <p className="text-xs mt-1">Add avatars to create group scenes</p>
                </div>
              ) : (
                avatars.map((avatar, index) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedObjectId === avatar.id
                        ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                    }`}
                    onClick={() => onSelectObject(avatar.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white flex items-center gap-2">
                          {avatar.name || `Avatar ${index + 1}`}
                          {selectedObjectId === avatar.id && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Pos: ({avatar.position[0].toFixed(1)}, {avatar.position[2].toFixed(1)})
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateAvatar(avatar);
                          }}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-400"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAvatar(avatar.id);
                          }}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-red-600 text-red-400 hover:text-white"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="furniture" className="h-full p-4 overflow-y-auto m-0">
            <div className="space-y-3">
              {furniture.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Armchair className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No furniture in scene</p>
                  <p className="text-xs mt-1">Add props to build your space</p>
                </div>
              ) : (
                furniture.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedObjectId === item.id
                        ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                    }`}
                    onClick={() => onSelectObject(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white flex items-center gap-2">
                          {item.name}
                          {selectedObjectId === item.id && (
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {item.category} • ({item.position[0].toFixed(1)}, {item.position[2].toFixed(1)})
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateFurniture(item);
                          }}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-purple-400"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFurniture(item.id);
                          }}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-red-600 text-red-400 hover:text-white"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}