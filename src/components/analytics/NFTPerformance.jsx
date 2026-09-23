import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function NFTPerformance({ timeRange }) {
  const data = [
    { name: 'Genesis', sales: 45, volume: 12.5, avgPrice: 0.28 },
    { name: 'Limited', sales: 12, volume: 5.4, avgPrice: 0.45 },
    { name: 'Collab', sales: 8, volume: 3.2, avgPrice: 0.40 },
    { name: 'Exclusive', sales: 6, volume: 2.7, avgPrice: 0.45 },
    { name: 'Rare', sales: 4, volume: 1.8, avgPrice: 0.45 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
          <p className="text-xs font-mono text-gray-400 mb-2">{label} Collection</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-cyan-400">Sales:</span>
              <span className="text-sm font-bold text-white">{payload[0].value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-purple-400">Volume:</span>
              <span className="text-sm font-bold text-white">{payload[1].value} ETH</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-pink-400">Avg Price:</span>
              <span className="text-sm font-bold text-white">{payload[0].payload.avgPrice} ETH</span>
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
        <CardTitle className="text-sm font-mono text-gray-400">NFT SALES PERFORMANCE</CardTitle>
        <p className="text-xs text-gray-500 mt-1">Sales and volume by collection</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#71717a" 
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#71717a" 
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              iconType="circle"
            />
            <Bar 
              yAxisId="left"
              dataKey="sales" 
              fill="url(#colorSales)" 
              radius={[8, 8, 0, 0]}
              name="Sales"
            />
            <Bar 
              yAxisId="right"
              dataKey="volume" 
              fill="url(#colorVolume)" 
              radius={[8, 8, 0, 0]}
              name="Volume (ETH)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}