import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function FollowerGrowthChart({ timeRange }) {
  // Generate cumulative follower growth data
  const generateData = () => {
    const dataPoints = {
      '24h': 24,
      '7d': 7,
      '30d': 30,
      '90d': 12,
      '1y': 12,
      'all': 12
    };

    const points = dataPoints[timeRange] || 7;
    const data = [];
    let baseFollowers = 10000;

    for (let i = 0; i < points; i++) {
      const growth = Math.floor(Math.random() * 200) + 50;
      baseFollowers += growth;
      
      data.push({
        name: timeRange === '24h' ? `${i}:00` : 
              timeRange === '7d' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
              timeRange === '30d' ? `Day ${i + 1}` :
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        followers: baseFollowers,
        newFollowers: growth
      });
    }

    return data;
  };

  const data = generateData();
  const totalGrowth = data[data.length - 1].followers - data[0].followers;
  const growthPercentage = ((totalGrowth / data[0].followers) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
          <p className="text-xs font-mono text-gray-400 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-purple-400">Total:</span>
              <span className="text-sm font-bold text-white">{payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-green-400">New:</span>
              <span className="text-sm font-bold text-white">+{payload[0].payload.newFollowers}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-mono text-gray-400">FOLLOWER GROWTH</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Cumulative follower count</p>
          </div>
          <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{growthPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Current</p>
            <p className="text-2xl font-black text-white">{data[data.length - 1].followers.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Growth</p>
            <p className="text-2xl font-black text-green-400">+{totalGrowth.toLocaleString()}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <YAxis 
              stroke="#71717a" 
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="followers" 
              stroke="#a855f7" 
              fillOpacity={1} 
              fill="url(#colorFollowers)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}