import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileVideo, FileAudio, FileImage, Image, Folder,
  Search, Plus, MoreVertical
} from 'lucide-react';

const FOLDER_TYPES = [
  { id: 'all', label: 'All Files', icon: Folder },
  { id: 'audio', label: 'Audio', icon: FileAudio },
  { id: 'video', label: 'Video', icon: FileVideo },
  { id: 'images', label: 'Images', icon: FileImage },
  { id: 'recordings', label: 'Recordings', icon: Image },
];

export default function AssetLibrary({ 
  assets = [], 
  selectedFolder,
  onFolderChange,
  onAddAsset,
  onDragStart
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAssets = assets.filter(asset => {
    const matchesFolder = selectedFolder === 'all' || asset.type === selectedFolder;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#00D4FF]/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white font-mono text-sm">
            <span className="text-[#00D4FF]">// </span>ASSET_LIBRARY
          </h3>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="w-4 h-4 text-[#00D4FF]" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="pl-8 bg-[#0A0A0F] border-[#00D4FF]/30 h-8 text-xs"
          />
        </div>
      </div>
      
      {/* Folders */}
      <div className="p-2 border-b border-[#00D4FF]/20">
        <div className="space-y-1">
          {FOLDER_TYPES.map(folder => {
            const Icon = folder.icon;
            const count = folder.id === 'all' 
              ? assets.length 
              : assets.filter(a => a.type === folder.id).length;
            
            return (
              <button
                key={folder.id}
                onClick={() => onFolderChange(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  selectedFolder === folder.id
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-mono">{folder.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-5">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Assets List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredAssets.length === 0 ? (
            <div className="py-8 text-center">
              <Folder className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/40">No assets found</p>
            </div>
          ) : (
            filteredAssets.map(asset => {
              const Icon = asset.type === 'video' ? FileVideo :
                          asset.type === 'audio' ? FileAudio :
                          FileImage;
              
              return (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('asset', JSON.stringify(asset));
                    onDragStart?.(asset);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[#0A0A0F] border border-[#00D4FF]/20 hover:border-[#00D4FF]/50 cursor-move transition-all"
                >
                  {/* Thumbnail or Icon */}
                  <div className="w-12 h-12 rounded bg-[#0D0D14] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {asset.thumbnail ? (
                      <img src={asset.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-6 h-6 text-[#00D4FF]" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate font-mono">
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {asset.duration > 0 && (
                        <span className="text-[10px] text-[#00D4FF]">
                          {formatDuration(asset.duration)}
                        </span>
                      )}
                      {asset.size && (
                        <span className="text-[10px] text-white/40">
                          {formatSize(asset.size)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}