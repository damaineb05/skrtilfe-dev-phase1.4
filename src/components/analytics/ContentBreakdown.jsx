import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ContentBreakdown({ timeRange }) {
  const data = [
    { name: 'Images', value: 45, color: '#22d3ee' },
    { name: 'Videos', value: 30, color: '#ec4899' },
    { name: 'NFTs', value: 15, color: '#a855f7' },
    { name: 'Stories', value: 10, color: '#10b981' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
          <p className="text-xs font-mono text-gray-400 mb-1">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].payload.color }}
            />
            <span className="text-sm font-bold text-white">{payload[0].value} posts</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm font-mono text-gray-400">CONTENT BREAKDOWN</CardTitle>
        <p className="text-xs text-gray-500 mt-1">Distribution by content type</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-white">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{item.value}</p>
                  <p className="text-xs text-gray-400">
                    {((item.value / data.reduce((sum, entry) => sum + entry.value, 0)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t border-zinc-700">
              <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30">
                <span className="text-sm font-bold text-cyan-400">Total Posts</span>
                <span className="text-2xl font-black text-white">
                  {data.reduce((sum, item) => sum + item.value, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}