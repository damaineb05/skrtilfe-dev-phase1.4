import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Flag, 
  AlertTriangle, 
  UserX,
  Eye,
  Check,
  X,
  Clock,
  Search,
  Ban,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockReports = [
  {
    id: 1,
    type: 'spam',
    content: 'Buy cheap NFTs at...',
    reportedBy: 'user123',
    reportedUser: 'spammer_bot',
    timestamp: '2024-12-01T10:30:00',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    type: 'harassment',
    content: 'Offensive comment targeting another user...',
    reportedBy: 'alice_nft',
    reportedUser: 'toxic_user99',
    timestamp: '2024-12-01T09:15:00',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 3,
    type: 'misinformation',
    content: 'False claims about project...',
    reportedBy: 'moderator1',
    reportedUser: 'fud_spreader',
    timestamp: '2024-12-01T08:45:00',
    status: 'reviewing',
    priority: 'medium'
  },
  {
    id: 4,
    type: 'inappropriate',
    content: 'NSFW content posted in general chat',
    reportedBy: 'user456',
    reportedUser: 'bad_actor',
    timestamp: '2024-11-30T22:00:00',
    status: 'resolved',
    priority: 'low'
  }
];

const mockBannedUsers = [
  { id: 1, handle: 'spammer_bot', reason: 'Repeated spam', bannedAt: '2024-11-28', bannedBy: 'admin', type: 'permanent' },
  { id: 2, handle: 'toxic_user', reason: 'Harassment', bannedAt: '2024-11-25', bannedBy: 'mod1', type: 'temporary', expiresAt: '2024-12-25' },
];

const reportTypeIcons = {
  spam: AlertCircle,
  harassment: UserX,
  misinformation: AlertTriangle,
  inappropriate: Eye,
  other: Flag
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const statusColors = {
  pending: 'bg-orange-500/20 text-orange-400',
  reviewing: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-gray-500/20 text-gray-400'
};

export default function ModerationPanel() {
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState(mockReports);

  const stats = {
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedToday: 12,
    bannedUsers: mockBannedUsers.length,
    activeFlags: 3
  };

  const handleResolve = (reportId, action) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: action === 'approve' ? 'resolved' : 'dismissed' } : r
    ));
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = !searchQuery || 
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportedUser.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            Moderation Center
          </h2>
          <p className="text-gray-400 text-sm mt-1">Manage reports and community safety</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Reports', value: stats.pendingReports, icon: Clock, color: 'text-orange-400' },
          { label: 'Resolved Today', value: stats.resolvedToday, icon: Check, color: 'text-green-400' },
          { label: 'Banned Users', value: stats.bannedUsers, icon: Ban, color: 'text-red-400' },
          { label: 'Active Flags', value: stats.activeFlags, icon: Flag, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
          <TabsTrigger value="reports" className="data-[state=active]:bg-zinc-700 rounded-lg">
            <Flag className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="banned" className="data-[state=active]:bg-zinc-700 rounded-lg">
            <Ban className="w-4 h-4 mr-2" />
            Banned Users
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-700 rounded-lg">
            <FileText className="w-4 h-4 mr-2" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.map((report, index) => {
              const TypeIcon = reportTypeIcons[report.type] || Flag;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityColors[report.priority]}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={priorityColors[report.priority]}>
                              {report.priority} priority
                            </Badge>
                            <Badge className={statusColors[report.status]}>
                              {report.status}
                            </Badge>
                            <Badge className="bg-zinc-800 text-gray-400">
                              {report.type}
                            </Badge>
                          </div>
                          <p className="text-white font-medium">
                            Report against <span className="text-cyan-400">@{report.reportedUser}</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(report.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        "{report.content}"
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Reported by @{report.reportedBy}
                        </p>

                        {report.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleResolve(report.id, 'dismiss')}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleResolve(report.id, 'approve')}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Take Action
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No reports found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="banned" className="mt-6">
          <div className="space-y-3">
            {mockBannedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Ban className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">@{user.handle}</p>
                      <p className="text-sm text-gray-400">{user.reason}</p>
                      <p className="text-xs text-gray-500">
                        Banned on {user.bannedAt} by {user.bannedBy}
                        {user.type === 'temporary' && ` · Expires ${user.expiresAt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={user.type === 'permanent' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {user.type}
                    </Badge>
                    <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white">
                      Unban
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Activity logs will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}