import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, MessageCircle, Heart, Star,
  MoreHorizontal, Share2, Flag, UserMinus, Bell,
  Settings, Image, Grid3x3, Bookmark, Shield,
  Crown, Globe, TrendingUp, Twitter, Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function StatBox({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
    </div>
  );
}

export default function UserProfileCard({ user, isOwnProfile = false, onFollow, onMessage }) {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [activeTab, setActiveTab] = useState('posts');

  const defaultProfile = {
    full_name: 'Alex Matrix',
    handle: 'alexmatrix',
    bio: 'Digital fashion enthusiast · NFT collector · Building the future of wearables.',
    location: 'New York, NY',
    website: 'https://alexmatrix.xyz',
    twitter: 'alexmatrix',
    instagram: 'alexmatrix',
    joinDate: '2023-06-15',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    stats: { posts: 127, followers: 24000, following: 892, likes: 56000 },
    badges: ['Genesis Holder', 'Early Adopter', 'Top Creator'],
    isVerified: true,
    nftsOwned: 24,
    groupsJoined: 8,
    totalSales: 18400,
    rank: 'Elite',
  };

  const p = { ...defaultProfile, ...user, stats: { ...defaultProfile.stats, ...(user?.stats || {}) } };

  const mockPosts = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400',
  ];

  const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Cover */}
      <div className="relative h-40 sm:h-52">
        <img src={p.coverImage} alt="Cover" className="w-full h-full object-cover" style={{ filter: 'grayscale(20%) brightness(0.7)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #0A0A0F 0%, rgba(10,10,15,0.4) 60%, transparent 100%)' }} />

        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>
          <Crown className="w-3 h-3" />{p.rank}
        </div>

        {isOwnProfile && (
          <Button size="sm" className="absolute top-4 right-4 text-white text-xs"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
            <Image className="w-3 h-3 mr-1" />Edit Cover
          </Button>
        )}
      </div>

      <div className="px-5 pb-6 -mt-12">
        {/* Avatar + actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl p-[2px]"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="w-full h-full rounded-[14px] flex items-center justify-center text-4xl font-black text-white"
              style={{ background: '#1A1A28' }}>
              {p.full_name?.charAt(0) || 'U'}
            </div>
            {p.isVerified && (
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#fff', border: '2px solid #0A0A0F' }}>
                <Shield className="w-3.5 h-3.5 text-black" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <Button className="text-white font-semibold text-xs px-4"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Settings className="w-3.5 h-3.5 mr-1.5" />Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={() => onMessage?.()} className="w-9 h-9 p-0 text-white"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button onClick={() => { setIsFollowing(!isFollowing); onFollow?.(!isFollowing); }}
                  className="font-bold text-xs px-5"
                  style={isFollowing
                    ? { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }
                    : { background: '#fff', color: '#0A0A0F', border: 'none' }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-9 h-9 p-0 text-white"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <DropdownMenuItem className="text-white hover:bg-white/5 cursor-pointer"><Share2 className="w-4 h-4 mr-2" />Share Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/5 cursor-pointer"><Bell className="w-4 h-4 mr-2" />Notifications</DropdownMenuItem>
                    <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <DropdownMenuItem className="text-white hover:bg-white/5 cursor-pointer"><UserMinus className="w-4 h-4 mr-2" />Block User</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-white/5 cursor-pointer"><Flag className="w-4 h-4 mr-2" />Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{p.full_name}</h1>
            {p.isVerified && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                Verified
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>@{p.handle}</p>
        </div>

        {/* Bio */}
        {p.bio && <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.bio}</p>}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {p.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.location}</span>}
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Globe className="w-3.5 h-3.5" />{p.website.replace('https://', '')}
            </a>
          )}
          {p.twitter && (
            <a href={`https://twitter.com/${p.twitter}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors">
              <Twitter className="w-3.5 h-3.5" />@{p.twitter}
            </a>
          )}
          {p.instagram && <span className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5" />@{p.instagram}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {fmtDate(p.joinDate)}</span>
        </div>

        {/* Badges */}
        {p.badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {p.badges.map((badge, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <StatBox value={fmt(p.stats.posts)}     label="Posts"     />
          <StatBox value={fmt(p.stats.followers)} label="Followers" />
          <StatBox value={fmt(p.stats.following)} label="Following" />
          <StatBox value={fmt(p.stats.likes)}     label="Likes"     />
          <StatBox value={p.nftsOwned}            label="NFTs"      />
          <StatBox value={p.groupsJoined}         label="Groups"    />
        </div>

        {/* Sales */}
        {p.totalSales > 0 && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Total Sales Volume</span>
            </div>
            <span className="text-base font-black text-white">${fmt(p.totalSales)}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 p-1 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { value: 'posts', icon: Grid3x3, label: 'Posts' },
              { value: 'likes', icon: Heart,    label: 'Likes' },
              { value: 'saved', icon: Bookmark, label: 'Saved' },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-3 gap-1.5">
              {mockPosts.map((src, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                  style={{ background: '#1A1A28' }}>
                  <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale-[20%]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="likes">
            <div className="text-center py-12">
              <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Liked posts will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="text-center py-12">
              <Bookmark className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Saved posts will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}