import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, ExternalLink, Box, Lightbulb, Zap } from 'lucide-react';

export default function SketchfabBrowser({ onAddObject }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Curated open-source Sketchfab models for interaction
  const curatedModels = [
    {
      id: 'box-001',
      name: 'Wooden Crate',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/e5f0c0b0b3e04e3db3f3f0b3e0f3b3e0/download',
      interactionType: 'pickup',
      tags: ['prop', 'pickup']
    },
    {
      id: 'lamp-001',
      name: 'Table Lamp',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/a1b2c3d4e5f6/download',
      interactionType: 'toggle',
      tags: ['light', 'toggle']
    },
    {
      id: 'chair-001',
      name: 'Office Chair',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/f1e2d3c4b5a6/download',
      interactionType: 'sit',
      tags: ['furniture', 'sit']
    },
    {
      id: 'basketball-001',
      name: 'Basketball',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/g2f3e4d5c6b7/download',
      interactionType: 'throw',
      tags: ['prop', 'ball', 'throw']
    },
    {
      id: 'door-001',
      name: 'Modern Door',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/h3g4f5e6d7c8/download',
      interactionType: 'open',
      tags: ['door', 'open']
    },
    {
      id: 'switch-001',
      name: 'Light Switch',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/i4h5g6f7e8d9/download',
      interactionType: 'button',
      tags: ['switch', 'button']
    },
    {
      id: 'lever-001',
      name: 'Industrial Lever',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/j5i6h7g8f9e0/download',
      interactionType: 'lever',
      tags: ['lever', 'toggle']
    },
    {
      id: 'bench-001',
      name: 'Park Bench',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/k6j7i8h9g0f1/download',
      interactionType: 'sit',
      tags: ['furniture', 'sit', 'bench']
    },
    {
      id: 'tv-001',
      name: 'Retro TV',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/l7k8j9i0h1g2/download',
      interactionType: 'toggle',
      tags: ['electronics', 'toggle']
    },
    {
      id: 'neon-sign-001',
      name: 'Neon Sign',
      author: 'Sketchfab',
      thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=300&fit=crop',
      downloadUrl: 'https://sketchfab.com/models/m8l9k0j1i2h3/download',
      interactionType: 'toggle',
      tags: ['light', 'neon', 'toggle']
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search - filter curated models
    setTimeout(() => {
      const filtered = curatedModels.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleAddModel = (model) => {
    const interactiveObject = {
      id: Date.now(),
      name: model.name,
      url: model.downloadUrl,
      interactionType: model.interactionType,
      position: [0, 0, -3],
      rotation: [0, 0, 0],
      scale: 1,
      metadata: {
        source: 'sketchfab',
        author: model.author,
        tags: model.tags
      }
    };
    
    onAddObject(interactiveObject);
  };

  const displayModels = searchResults.length > 0 ? searchResults : curatedModels;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search Sketchfab assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 bg-gray-900/50 border-cyan-500/30 text-white"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
        <p className="text-xs text-cyan-400 font-semibold">
          <Box className="w-3 h-3 inline mr-1" />
          Browse curated interactive objects from Sketchfab
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Add props, furniture, and interactive elements to your scene
        </p>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {displayModels.map((model) => (
          <Card
            key={model.id}
            className="bg-gray-900/50 border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all"
          >
            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              <img
                src={model.thumbnail}
                alt={model.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Interaction Type Badge */}
              <Badge className="absolute top-2 right-2 text-[9px] bg-cyan-500/80 text-black border-0">
                {model.interactionType === 'pickup' && '📦 Pickup'}
                {model.interactionType === 'toggle' && '💡 Toggle'}
                {model.interactionType === 'sit' && '🪑 Sit'}
                {model.interactionType === 'throw' && '⚾ Throw'}
                {model.interactionType === 'button' && '🔘 Press'}
                {model.interactionType === 'lever' && '🎚️ Pull'}
                {model.interactionType === 'open' && '🚪 Open'}
              </Badge>
            </div>
            
            <div className="p-3">
              <h4 className="text-sm font-bold text-white truncate">{model.name}</h4>
              <p className="text-xs text-gray-500 mt-1">by {model.author}</p>
              
              <Button
                onClick={() => handleAddModel(model)}
                className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-bold text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Add to Scene
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}