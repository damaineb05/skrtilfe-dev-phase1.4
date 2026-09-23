import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Heart,
  Users,
  MessageCircle,
  Share2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsOverview({ timeRange, contentOnly = false }) {
  const metrics = contentOnly ? [
    { label: 'Total Reach', value: '45.2K', change: '+12.5%', icon: Eye, positive: true, color: 'text-cyan-400' },
    { label: 'Engagement Rate', value: '8.2%', change: '+2.1%', icon: Heart, positive: true, color: 'text-pink-400' },
    { label: 'Avg. Likes', value: '892', change: '+15.3%', icon: Heart, positive: true, color: 'text-red-400' },
    { label: 'Comments', value: '2.1K', change: '+8.7%', icon: MessageCircle, positive: true, color: 'text-blue-400' }
  ] : [
    { label: 'Total Reach', value: '45.2K', change: '+12.5%', icon: Eye, positive: true, color: 'text-cyan-400' },
    { label: 'Engagement Rate', value: '8.2%', change: '+2.1%', icon: Heart, positive: true, color: 'text-pink-400' },
    { label: 'Followers', value: '12.5K', change: '+156', icon: Users, positive: true, color: 'text-purple-400' },
    { label: 'Interactions', value: '8.9K', change: '+892', icon: MessageCircle, positive: true, color: 'text-blue-400' },
    { label: 'Shares', value: '1.2K', change: '+234', icon: Share2, positive: true, color: 'text-green-400' },
    { label: 'Growth Rate', value: '5.8%', change: '-0.3%', icon: TrendingUp, positive: false, color: 'text-yellow-400' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <Badge className={`text-xs ${
                  metric.positive 
                    ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                    : 'bg-red-400/20 text-red-400 border-red-400/30'
                }`}>
                  {metric.positive ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <p className="text-2xl md:text-3xl font-black text-white mb-1">{metric.value}</p>
              <p className="text-xs font-mono text-gray-400 uppercase">{metric.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}