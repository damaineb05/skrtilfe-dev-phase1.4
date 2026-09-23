import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DripSyncPopularity({ timeRange }) {
  const data = [
    { category: 'Tops', views: 2345, saves: 456, wearables: 34 },
    { category: 'Bottoms', views: 1892, saves: 389, wearables: 28 },
    { category: 'Shoes', views: 1654, saves: 342, wearables: 22 },
    { category: 'Accessories', views: 1423, saves: 298, wearables: 45 },
    { category: 'Outerwear', views: 1234, saves: 256, wearables: 18 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
          <p className="text-xs font-mono text-gray-400 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-cyan-400">Views:</span>
              <span className="text-sm font-bold text-white">{payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-pink-400">Saves:</span>
              <span className="text-sm font-bold text-white">{payload[1].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-purple-400">Items:</span>
              <span className="text-sm font-bold text-white">{payload[0].payload.wearables}</span>
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
        <CardTitle className="text-sm font-mono text-gray-400">WEARABLES POPULARITY</CardTitle>
        <p className="text-xs text-gray-500 mt-1">Views and saves by category</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="category" 
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
            <Bar 
              dataKey="views" 
              fill="url(#colorViews)" 
              radius={[8, 8, 0, 0]}
              name="Views"
            />
            <Bar 
              dataKey="saves" 
              fill="url(#colorSaves)" 
              radius={[8, 8, 0, 0]}
              name="Saves"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}