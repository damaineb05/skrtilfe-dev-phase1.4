import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  Lock,
  MessageCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const groups = [
  {
    id: 1,
    name: 'Digital Fashion Collective',
    description: 'Exploring the intersection of fashion and technology',
    members: 12400,
    posts: 1234,
    image: '👗',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    isPrivate: false,
    isMember: true,
    category: 'Fashion',
    trending: true
  },
  {
    id: 2,
    name: 'NFT Traders Guild',
    description: 'Share strategies and discoveries in the NFT space',
    members: 8200,
    posts: 2456,
    image: '💎',
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    isPrivate: false,
    isMember: false,
    category: 'Web3'
  },
  {
    id: 3,
    name: 'Avatar Creators Hub',
    description: 'Build and customize amazing 3D avatars',
    members: 5600,
    posts: 890,
    image: '🎨',
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    isPrivate: false,
    isMember: true,
    category: 'Creative'
  },
  {
    id: 4,
    name: 'Genesis Pass Holders',
    description: 'Exclusive community for Genesis NFT holders',
    members: 2100,
    posts: 456,
    image: '🔮',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    isPrivate: true,
    isMember: false,
    category: 'Exclusive'
  },
  {
    id: 5,
    name: 'Streetwear Culture',
    description: 'Discuss and share streetwear fashion trends',
    members: 15800,
    posts: 3200,
    image: '👟',
    cover: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
    isPrivate: false,
    isMember: true,
    category: 'Fashion',
    trending: true
  },
  {
    id: 6,
    name: 'Metaverse Builders',
    description: 'Creating experiences in virtual worlds',
    members: 4300,
    posts: 678,
    image: '🏗️',
    cover: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800',
    isPrivate: false,
    isMember: false,
    category: 'Tech'
  },
];

const categories = ['All', 'Fashion', 'Web3', 'Creative', 'Tech', 'Exclusive'];

export default function CommunityGroups({ onSelectGroup }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myGroups = filteredGroups.filter(g => g.isMember);
  const discoverGroups = filteredGroups.filter(g => !g.isMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Groups
          </h2>
          <p className="text-gray-400 text-sm mt-1">Connect with communities that share your interests</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            My Groups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map((group, index) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                index={index}
                onSelect={() => onSelectGroup?.(group)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Discover Groups */}
      {discoverGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Discover
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoverGroups.map((group, index) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                index={index}
                onSelect={() => onSelectGroup?.(group)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No groups found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, index, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all cursor-pointer group"
    >
      {/* Cover Image */}
      <div className="h-24 relative overflow-hidden">
        <img 
          src={group.cover} 
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        {group.trending && (
          <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white text-[10px]">
            🔥 Trending
          </Badge>
        )}
        {group.isPrivate && (
          <Badge className="absolute top-2 left-2 bg-zinc-900/90 text-white text-[10px]">
            <Lock className="w-3 h-3 mr-1" />
            Private
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 -mt-6 relative">
        <div className="w-14 h-14 rounded-xl bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center text-2xl mb-3">
          {group.image}
        </div>
        
        <h4 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
          {group.name}
        </h4>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{group.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {(group.members / 1000).toFixed(1)}K
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {group.posts}
            </span>
          </div>
          
          {group.isMember ? (
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
              Member
            </Badge>
          ) : (
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-bold rounded-full px-4">
              Join
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}