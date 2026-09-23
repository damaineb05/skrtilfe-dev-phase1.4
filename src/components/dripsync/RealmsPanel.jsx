import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Sparkles, 
  Moon, 
  Sunset, 
  TreePine,
  Check,
  Globe,
  Home,
  Box,
  Upload,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

// 3D Environment configurations (moved from BackgroundSelector)
const ENVIRONMENT_3D_OPTIONS = [
  {
    id: 'bremner-penthouse',
    name: '120 Bremner Penthouse',
    description: 'Luxurious downtown penthouse — walk through premium interior spaces with panoramic city views',
    type: '3d-environment',
    preview: 'linear-gradient(135deg, #0a0a14 0%, #1a1228 30%, #c9a84c 60%, #2d1f08 100%)',
    sketchfabId: 'ae0d0c14d5fb42a8bcea7164daf8a294',
    modelUrl: 'https://api.sketchfab.com/v3/models/ae0d0c14d5fb42a8bcea7164daf8a294/download',
    config: {
      targetMaxSize: 50,
      skyColor: 0x87ceeb,
      groundColor: 0xf0e8d0,
      fogColor: 0xd4c5a0,
      fogDensity: 0.003,
      ambientIntensity: 1.8,
      directionalColor: 0xffffee,
      directionalIntensity: 1.4,
      enableCollisions: true,
      enableShadows: true,
      floorAtZero: true,
      gridColor: 0xc9a84c,
      gridSecondaryColor: 0x8b6914,
      particles: 'dust',
      particleColor: 0xffe4a0,
      isInterior: true,
    }
  },
  {
    id: 'ps2-scifi-interior',
    name: 'PS2 Sci-Fi Interior',
    description: 'Retro sci-fi interior — avatar-scale corridors with collision walkability',
    type: '3d-environment',
    preview: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #0d1a3e 100%)',
    sketchfabId: 'a582b044e9a343d5861d06bcdc9560b5',
    modelUrl: 'https://api.sketchfab.com/v3/models/a582b044e9a343d5861d06bcdc9560b5/download',
    config: {
      targetMaxSize: 40,
      scale: 0.008,
      skyColor: 0x050510,
      groundColor: 0x111133,
      fogColor: 0x050510,
      fogDensity: 0.02,
      ambientIntensity: 1.2,
      directionalColor: 0x4488ff,
      directionalIntensity: 1.0,
      enableCollisions: true,
      enableShadows: true,
      floorAtZero: true,
      gridColor: 0x0044ff,
      gridSecondaryColor: 0x002288,
      particles: 'dust',
      particleColor: 0x4488ff,
    }
  }
];

import EnvironmentUploader from './EnvironmentUploader';

// Real GLB environment URLs - procedurally generated 3D environments
const PRESET_REALMS = [];

/*
    name: 'Low Poly Room',
    description: 'Stylized low-poly interior space - Default environment',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    icon: Home,
    type: 'indoor',
    environment_url: 'https://sketchfab.com/models/b7e3f3f0b3e04e3db3f3f0b3e0f3b3e0/download',
    sketchfab_url: 'https://skfb.ly/oYNHF',
    skybox: 'neutral',
    ambientLight: { color: '#ffffff', intensity: 1.0 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    isDefault: true
  },
  {
    id: 'skrtlife_studio',
    name: 'Skrtlife Studio',
    description: 'Clean white studio with professional lighting',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    icon: Home,
    type: 'studio',
    environment_url: null,
    skybox: 'neutral',
    ambientLight: { color: '#ffffff', intensity: 1.3 },
    featured: true,
    collisions_enabled: false,
    generatedScene: 'studio'
  },
  {
    id: 'cyberpunk_alley',
    name: 'Cyberpunk Alley',
    description: 'Neon-lit urban alleyway with rain effects',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#ff00ff', intensity: 0.6 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'cyberpunk'
  },
  {
    id: 'japanese_street',
    name: 'Tokyo Street',
    description: 'Atmospheric Japanese street at night',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#ffaa66', intensity: 0.7 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'tokyo'
  },
  {
    id: 'sci_fi_corridor',
    name: 'Sci-Fi Corridor',
    description: 'Futuristic spaceship interior',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'space',
    ambientLight: { color: '#00ffff', intensity: 0.8 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'scifi'
  },
  {
    id: 'sponza_palace',
    name: 'Sponza Palace',
    description: 'Classic architecture showcase environment',
    thumbnail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'indoor',
    environment_url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Sponza/glTF-Binary/Sponza.glb',
    skybox: 'indoor',
    ambientLight: { color: '#fff5e6', intensity: 0.8 },
    featured: false,
    collisions_enabled: true,
    scale: 0.01
  },
  {
    id: 'neon_arcade',
    name: 'Neon Arcade',
    description: 'Retro gaming arcade with glowing machines',
    thumbnail: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#ff00aa', intensity: 0.7 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'arcade'
  },
  {
    id: 'rooftop_city',
    name: 'City Rooftop',
    description: 'Urban rooftop with city skyline views',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'sunset',
    ambientLight: { color: '#ff8844', intensity: 0.9 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'rooftop'
  },
  {
    id: 'underwater_ruins',
    name: 'Underwater Ruins',
    description: 'Mystical sunken temple with bioluminescence',
    thumbnail: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=300&fit=crop',
    icon: Globe,
    type: 'outdoor',
    environment_url: null,
    skybox: 'underwater',
    ambientLight: { color: '#0088ff', intensity: 0.5 },
    featured: false,
    collisions_enabled: false,
    scale: 1,
    generatedScene: 'underwater'
  },
  {
    id: 'forest_clearing',
    name: 'Enchanted Forest',
    description: 'Magical forest with glowing particles',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    icon: TreePine,
    type: 'outdoor',
    environment_url: null,
    skybox: 'forest',
    ambientLight: { color: '#88ff88', intensity: 0.8 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'forest'
  },
  {
    id: 'space_station',
    name: 'Space Station',
    description: 'Orbital station with Earth view',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop',
    icon: Globe,
    type: 'indoor',
    environment_url: null,
    skybox: 'space',
    ambientLight: { color: '#aaccff', intensity: 0.6 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'spacestation'
  },
  {
    id: 'desert_oasis',
    name: 'Desert Oasis',
    description: 'Tranquil oasis with palm trees and water',
    thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop',
    icon: Sunset,
    type: 'outdoor',
    environment_url: null,
    skybox: 'desert',
    ambientLight: { color: '#ffcc88', intensity: 1.1 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'desert'
  },
  {
    id: 'skate_park',
    name: 'Urban Skate Park',
    description: 'Concrete skate park with graffiti art',
    thumbnail: 'https://images.unsplash.com/photo-1564429238877-1e3b3a0a4d3b?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'day',
    ambientLight: { color: '#ffffff', intensity: 1.2 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'skatepark'
  },
  {
    id: 'concert_stage',
    name: 'Concert Stage',
    description: 'Live music venue with lighting rigs',
    thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#ff44ff', intensity: 0.8 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'concert'
  },
  {
    id: 'medieval_tavern',
    name: 'Medieval Tavern',
    description: 'Cozy fantasy tavern with fireplace',
    thumbnail: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=300&fit=crop',
    icon: Moon,
    type: 'indoor',
    environment_url: null,
    skybox: 'indoor',
    ambientLight: { color: '#ffaa66', intensity: 0.6 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'tavern'
  },
  {
    id: 'museum_gallery',
    name: 'Art Gallery',
    description: 'Modern museum with exhibition spaces',
    thumbnail: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'indoor',
    environment_url: null,
    skybox: 'neutral',
    ambientLight: { color: '#ffffff', intensity: 1.0 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'gallery'
  },
  {
    id: 'vaporwave_room',
    name: 'Vaporwave Room',
    description: 'Retro aesthetic with pink and blue neon',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#ff66cc', intensity: 0.7 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'vaporwave'
  },
  {
    id: 'abandoned_mall',
    name: 'Abandoned Mall',
    description: 'Post-apocalyptic shopping center',
    thumbnail: 'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'indoor',
    environment_url: null,
    skybox: 'indoor',
    ambientLight: { color: '#aaaaaa', intensity: 0.5 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'mall'
  },
  {
    id: 'zen_garden',
    name: 'Zen Garden',
    description: 'Peaceful Japanese rock garden',
    thumbnail: 'https://images.unsplash.com/photo-1464823063530-08f10ed1a2dd?w=400&h=300&fit=crop',
    icon: TreePine,
    type: 'outdoor',
    environment_url: null,
    skybox: 'day',
    ambientLight: { color: '#f0f5e0', intensity: 1.0 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'zen'
  },
  {
    id: 'nightclub',
    name: 'Underground Club',
    description: 'Pulsing nightclub with DJ booth',
    thumbnail: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#6600ff', intensity: 0.6 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'nightclub'
  },
  {
    id: 'basketball_court',
    name: 'Basketball Court',
    description: 'Urban basketball court at sunset',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'sunset',
    ambientLight: { color: '#ffaa55', intensity: 1.0 },
    featured: true,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'basketball'
  },
  {
    id: 'cloud_kingdom',
    name: 'Cloud Kingdom',
    description: 'Floating islands above the clouds',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop',
    icon: Globe,
    type: 'outdoor',
    environment_url: null,
    skybox: 'day',
    ambientLight: { color: '#ffffff', intensity: 1.2 },
    featured: false,
    collisions_enabled: false,
    scale: 1,
    generatedScene: 'clouds'
  },
  {
    id: 'subway_station',
    name: 'Subway Station',
    description: 'Gritty underground metro platform',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'indoor',
    environment_url: null,
    skybox: 'indoor',
    ambientLight: { color: '#ffeecc', intensity: 0.6 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'subway'
  },
  {
    id: 'crystal_cave',
    name: 'Crystal Cave',
    description: 'Glowing crystal formations underground',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
    icon: Sparkles,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#44ffff', intensity: 0.5 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'crystal'
  },
  {
    id: 'beach_sunset',
    name: 'Beach Paradise',
    description: 'Tropical beach at golden hour',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    icon: Sunset,
    type: 'outdoor',
    environment_url: null,
    skybox: 'sunset',
    ambientLight: { color: '#ffcc66', intensity: 1.1 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'beach'
  },
  {
    id: 'haunted_mansion',
    name: 'Haunted Mansion',
    description: 'Spooky Victorian manor with fog',
    thumbnail: 'https://images.unsplash.com/photo-1509248961725-aec71c53eed7?w=400&h=300&fit=crop',
    icon: Moon,
    type: 'indoor',
    environment_url: null,
    skybox: 'night',
    ambientLight: { color: '#8888aa', intensity: 0.4 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'haunted'
  },
  {
    id: 'racing_track',
    name: 'Racing Circuit',
    description: 'High-speed race track with pit lane',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    icon: Building2,
    type: 'outdoor',
    environment_url: null,
    skybox: 'day',
    ambientLight: { color: '#ffffff', intensity: 1.3 },
    featured: false,
    collisions_enabled: true,
    scale: 1,
    generatedScene: 'racing'
  }
*/

export default function RealmsPanel({ currentRealm, onRealmChange, onCreateRealm, currentBackground, onBackgroundChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('environments');
  const [showUploader, setShowUploader] = useState(false);
  const [customEnvironments, setCustomEnvironments] = useState(() => {
    try {
      const saved = localStorage.getItem('dripsync-custom-environments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleEnvironmentUploaded = (envData) => {
    const updated = [...customEnvironments, envData];
    setCustomEnvironments(updated);
    localStorage.setItem('dripsync-custom-environments', JSON.stringify(updated));
    
    // Auto-select the new environment
    if (onBackgroundChange) {
      onBackgroundChange(envData);
    }
  };

  const handleRemoveCustomEnvironment = (envId) => {
    const updated = customEnvironments.filter(e => e.id !== envId);
    setCustomEnvironments(updated);
    localStorage.setItem('dripsync-custom-environments', JSON.stringify(updated));
  };

  const handleSelectPresetEnvironment = (env) => {
    if (onBackgroundChange) {
      onBackgroundChange(env);
    }
  };

  const filteredRealms = PRESET_REALMS.filter(realm => {
    const matchesSearch = realm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         realm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || realm.type === filterType;
    return matchesSearch && matchesType;
  });

  const featuredRealms = filteredRealms.filter(r => r.featured);
  const otherRealms = filteredRealms.filter(r => !r.featured);

  const handleEnvironmentSelect = (env) => {
    if (onBackgroundChange) {
      onBackgroundChange(env);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-cyan-500/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Realms & Environments</h3>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="grid grid-cols-2 mx-4 mt-2 bg-gray-900/50 border border-cyan-500/20">
          <TabsTrigger value="environments" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Box className="w-3 h-3 mr-1" />
            3D Environments
          </TabsTrigger>
          <TabsTrigger value="realms" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Globe className="w-3 h-3 mr-1" />
            Realms
          </TabsTrigger>
        </TabsList>

        {/* Environments Tab */}
        <TabsContent value="environments" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0 min-h-0">
          <p className="text-xs text-gray-400 mb-3">Choose a 3D environment for your avatar</p>
          
          {/* Custom Uploaded Environments */}
          {customEnvironments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Upload className="w-3 h-3" />
                Your Environments
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {customEnvironments.map((env) => (
                  <CustomEnvironmentCard
                    key={env.id}
                    environment={env}
                    isActive={currentBackground?.id === env.id}
                    onSelect={() => handleEnvironmentSelect({
                      id: env.id,
                      name: env.name,
                      type: '3d-environment',
                      description: env.description,
                      config: env.config,
                      environment_url: env.url || env.localUrl,
                      isCustom: true,
                    })}
                    onRemove={() => handleRemoveCustomEnvironment(env.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            Preset Environments
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {ENVIRONMENT_3D_OPTIONS.map((env) => (
              <EnvironmentCard
                key={env.id}
                environment={env}
                isActive={currentBackground?.id === env.id}
                onSelect={() => handleEnvironmentSelect(env)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Realms Tab */}
        <TabsContent value="realms" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <div className="p-4 border-b border-gray-700">
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-300">
                <strong>🎮 Controls:</strong> WASD to move, Space to jump, Mouse to look around
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search realms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'studio', 'indoor', 'outdoor'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filterType === type
                      ? 'bg-cyan-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Realms List */}
          <div className="p-4 space-y-4">
            {/* Featured Realms */}
            {featuredRealms.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Featured Environments
                </h4>
                <div className="space-y-3">
                  {featuredRealms.map((realm) => (
                    <RealmCard
                      key={realm.id}
                      realm={realm}
                      isActive={currentRealm?.id === realm.id}
                      onSelect={() => onRealmChange(realm)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Realms */}
            {otherRealms.length > 0 && (
              <div>
                {featuredRealms.length > 0 && (
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-4">
                    More Realms
                  </h4>
                )}
                <div className="space-y-3">
                  {otherRealms.map((realm) => (
                    <RealmCard
                      key={realm.id}
                      realm={realm}
                      isActive={currentRealm?.id === realm.id}
                      onSelect={() => onRealmChange(realm)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredRealms.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No realms found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t border-cyan-500/30">
        <Button
          onClick={() => setShowUploader(true)}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Environment (.glb)
        </Button>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          Supports files up to 500MB • Auto-scales for avatars
        </p>
      </div>

      {/* Environment Uploader Modal */}
      <EnvironmentUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onEnvironmentReady={handleEnvironmentUploaded}
      />
    </div>
  );
}

function CustomEnvironmentCard({ environment, isActive, onSelect, onRemove }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`relative overflow-hidden cursor-pointer transition-all bg-purple-900/30 border ${
          isActive
            ? 'ring-2 ring-purple-400 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            : 'border-purple-700/50 hover:border-purple-500/50'
        }`}
      >
        <div className="flex items-center p-3 gap-3">
          {/* Preview */}
          <div className="w-16 h-16 rounded-lg flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
            <Box className="w-8 h-8 text-white/80" />
            {isActive && (
              <div className="absolute inset-0 bg-purple-400/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-purple-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" onClick={onSelect}>
            <h4 className="text-sm font-bold text-white truncate">{environment.name}</h4>
            <p className="text-xs text-gray-400 line-clamp-1 mt-1">{environment.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30">
                Custom
              </Badge>
              <Badge className="text-[9px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                Scale: {environment.config?.scale || 1}x
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

function EnvironmentCard({ environment, isActive, onSelect }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onSelect}
        className={`relative overflow-hidden cursor-pointer transition-all bg-gray-900/50 border ${
          isActive
            ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
            : 'border-gray-700 hover:border-cyan-500/50'
        }`}
      >
        <div className="flex items-center p-3 gap-3">
          {/* Preview */}
          <div 
            className="w-16 h-16 rounded-lg flex-shrink-0 relative overflow-hidden"
            style={{ background: environment.preview }}
          >
            {/* Animated grid overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute bottom-0 left-0 right-0 h-1/2"
                style={{
                  backgroundImage: `linear-gradient(to right, ${environment.config?.gridColor ? '#' + environment.config.gridColor.toString(16).padStart(6, '0') : '#00ffff'}22 1px, transparent 1px),
                                   linear-gradient(to bottom, ${environment.config?.gridColor ? '#' + environment.config.gridColor.toString(16).padStart(6, '0') : '#00ffff'}22 1px, transparent 1px)`,
                  backgroundSize: '8px 8px',
                  transform: 'perspective(100px) rotateX(60deg)',
                  transformOrigin: 'bottom'
                }}
              />
            </div>
            {isActive && (
              <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-cyan-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{environment.name}</h4>
            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{environment.description}</p>
            <Badge className="mt-2 text-[10px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              3D Environment
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function RealmCard({ realm, isActive, onSelect }) {
  const Icon = realm.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onSelect}
        className={`relative overflow-hidden cursor-pointer transition-all ${
          isActive
            ? 'ring-2 ring-blue-600 shadow-lg'
            : 'hover:shadow-md'
        }`}
      >
        {/* Thumbnail */}
        <div className="relative h-24 overflow-hidden">
          <img
            src={realm.thumbnail}
            alt={realm.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Icon */}
          <div className="absolute top-2 left-2">
            <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-800" />
            </div>
          </div>

          {/* Active Indicator */}
          {isActive && (
            <div className="absolute top-2 right-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <Badge className="text-[10px] bg-black/60 text-white border-0">
              {realm.type}
            </Badge>
            {realm.collisions_enabled && (
              <Badge className="text-[10px] bg-green-600 text-white border-0">
                Walkable
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {realm.name}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                {realm.description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </div>
            {realm.environment_url && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Sparkles className="w-3 h-3" />
                <span>3D</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}