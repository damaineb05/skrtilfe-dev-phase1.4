import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Loader2,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  DollarSign,
  Zap,
  Activity,
  Calendar,
  Download,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsOverview from '../components/analytics/MetricsOverview';
import EngagementChart from '../components/analytics/EngagementChart';
import FollowerGrowthChart from '../components/analytics/FollowerGrowthChart';
import NFTPerformance from '../components/analytics/NFTPerformance';
import ContentBreakdown from '../components/analytics/ContentBreakdown';
import DripSyncPopularity from '../components/analytics/DripSyncPopularity';

function AnalyticsContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400 font-mono text-sm">LOADING ANALYTICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono text-gray-500 mb-2 tracking-wider">"DATA INTELLIGENCE"</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Analytics Dashboard</h1>
              <p className="text-sm text-gray-400">Track your performance across all platforms</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold">
                  <Activity className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-1 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-zinc-800">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="nft" className="data-[state=active]:bg-zinc-800">
              <Cpu className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">NFTs</span>
            </TabsTrigger>
            <TabsTrigger value="dripsync" className="data-[state=active]:bg-zinc-800">
              <Layers className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">DripSync</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <MetricsOverview timeRange={timeRange} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart timeRange={timeRange} />
              <FollowerGrowthChart timeRange={timeRange} />
            </div>

            <ContentBreakdown timeRange={timeRange} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6 space-y-6">
            <MetricsOverview timeRange={timeRange} contentOnly />
            
            <EngagementChart timeRange={timeRange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">TOP POSTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Genesis Drop Announcement', views: '12.5K', engagement: '8.2%', likes: '1.2K' },
                      { title: 'New Collection Preview', views: '9.8K', engagement: '6.5%', likes: '892' },
                      { title: 'Behind The Scenes', views: '7.3K', engagement: '5.8%', likes: '654' }
                    ].map((post, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">{post.title}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                          {post.engagement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">BEST POSTING TIMES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '6:00 PM - 8:00 PM', engagement: '9.2%', day: 'Weekdays' },
                      { time: '12:00 PM - 2:00 PM', engagement: '7.8%', day: 'Weekends' },
                      { time: '9:00 AM - 11:00 AM', engagement: '6.5%', day: 'Weekdays' }
                    ].map((slot, index) => (
                      <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{slot.time}</span>
                          <Badge variant="outline" className="text-xs">{slot.day}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                              style={{ width: slot.engagement }}
                            />
                          </div>
                          <span className="text-xs text-cyan-400 font-mono">{slot.engagement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NFT Tab */}
          <TabsContent value="nft" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Sales', value: '47.8 ETH', change: '+12.5%', icon: DollarSign, positive: true },
                { label: 'Items Sold', value: '156', change: '+8.2%', icon: Cpu, positive: true },
                { label: 'Avg. Price', value: '0.31 ETH', change: '-2.3%', icon: TrendingUp, positive: false },
                { label: 'Floor Price', value: '0.25 ETH', change: '+5.1%', icon: Zap, positive: true }
              ].map((metric, index) => (
                <Card key={index} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className="w-5 h-5 text-cyan-400" />
                      <Badge className={`text-xs ${metric.positive ? 'bg-green-400/20 text-green-400 border-green-400/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">{metric.value}</p>
                    <p className="text-xs font-mono text-gray-400">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <NFTPerformance timeRange={timeRange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">TOP SELLING NFTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Genesis #042', price: '1.2 ETH', sales: 5, image: '🎨' },
                      { name: 'Genesis #128', price: '0.95 ETH', sales: 3, image: '💎' },
                      { name: 'Genesis #007', price: '0.88 ETH', sales: 4, image: '👾' }
                    ].map((nft, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                        <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center text-2xl">
                          {nft.image}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{nft.name}</p>
                          <p className="text-xs text-gray-400">{nft.sales} sales</p>
                        </div>
                        <span className="text-sm font-bold text-cyan-400">{nft.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">COLLECTION PERFORMANCE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Genesis Collection', items: 156, volume: '47.8 ETH', floor: '0.25 ETH' },
                      { name: 'Limited Edition', items: 24, volume: '12.3 ETH', floor: '0.45 ETH' }
                    ].map((collection, index) => (
                      <div key={index} className="p-4 bg-zinc-800/50 rounded-lg">
                        <p className="text-sm font-bold text-white mb-3">{collection.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Items</p>
                            <p className="text-white font-mono">{collection.items}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Volume</p>
                            <p className="text-cyan-400 font-mono">{collection.volume}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Floor</p>
                            <p className="text-purple-400 font-mono">{collection.floor}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DripSync Tab */}
          <TabsContent value="dripsync" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: '247', change: '+15', icon: Layers, positive: true },
                { label: 'Looks Created', value: '89', change: '+23', icon: Sparkles, positive: true },
                { label: 'Views', value: '12.8K', change: '+892', icon: Eye, positive: true },
                { label: 'Saves', value: '1.2K', change: '+156', icon: Heart, positive: true }
              ].map((metric, index) => (
                <Card key={index} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className="w-5 h-5 text-pink-400" />
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">
                        +{metric.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">{metric.value}</p>
                    <p className="text-xs font-mono text-gray-400">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DripSyncPopularity timeRange={timeRange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">POPULAR WEARABLES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Cyber Hoodie Black', views: '2.3K', saves: 456, category: 'Tops' },
                      { name: 'Neon Sneakers', views: '1.9K', saves: 389, category: 'Shoes' },
                      { name: 'Tech Jacket', views: '1.7K', saves: 342, category: 'Outerwear' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {item.saves}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-gray-400">TRENDING LOOKS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Cyber Streetwear', views: '3.2K', likes: 678, shares: 89 },
                      { name: 'Minimal Tech', views: '2.8K', likes: 543, shares: 72 },
                      { name: 'Neo Tokyo', views: '2.1K', likes: 456, shares: 61 }
                    ].map((look, index) => (
                      <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                        <p className="text-sm font-medium text-white mb-2">{look.name}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {look.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {look.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            {look.shares}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}