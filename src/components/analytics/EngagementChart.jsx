import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function EngagementChart({ timeRange }) {
  // Generate mock data based on time range
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

    for (let i = 0; i < points; i++) {
      data.push({
        name: timeRange === '24h' ? `${i}:00` : 
              timeRange === '7d' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
              timeRange === '30d' ? `Day ${i + 1}` :
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        likes: Math.floor(Math.random() * 1000) + 500,
        comments: Math.floor(Math.random() * 300) + 100,
        shares: Math.floor(Math.random() * 150) + 50,
        engagement: Math.floor(Math.random() * 10) + 5
      });
    }

    return data;
  };

  const data = generateData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
          <p className="text-xs font-mono text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm font-mono text-gray-400">ENGAGEMENT OVER TIME</CardTitle>
        <p className="text-xs text-gray-500 mt-1">Likes, comments, and shares</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="likes" 
              stroke="#22d3ee" 
              fillOpacity={1} 
              fill="url(#colorLikes)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="comments" 
              stroke="#ec4899" 
              fillOpacity={1} 
              fill="url(#colorComments)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="shares" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorShares)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}