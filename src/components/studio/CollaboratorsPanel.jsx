import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Circle,
  Settings,
  Crown,
  Eye,
  Edit3,
  Lock,
  Unlock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export default function CollaboratorsPanel({
  session,
  activeUsers = [],
  currentUser,
  onInviteUser,
  onUpdatePermissions,
  onKickUser
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(session?.permissions?.edit_mode || 'free');

  const isOwner = session?.owner_email === currentUser?.email;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session?.session_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (inviteEmail.trim() && onInviteUser) {
      onInviteUser(inviteEmail);
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const handleEditModeChange = (mode) => {
    setEditMode(mode);
    if (onUpdatePermissions) {
      onUpdatePermissions({ edit_mode: mode });
    }
  };

  const getStatusColor = (lastActive) => {
    const secondsAgo = (Date.now() - new Date(lastActive).getTime()) / 1000;
    if (secondsAgo < 30) return 'bg-green-500';
    if (secondsAgo < 120) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="border-[#0088cc]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0088cc]" />
            <span>Collaborators</span>
            <Badge variant="secondary" className="text-[10px]">
              {activeUsers.length} Online
            </Badge>
          </div>
          
          {isOwner && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Edit Mode</label>
                    <Select value={editMode} onValueChange={handleEditModeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">
                          <div className="flex items-center gap-2">
                            <Unlock className="w-4 h-4" />
                            Free Edit - Anyone can edit
                          </div>
                        </SelectItem>
                        <SelectItem value="locked">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Locked - Only owner can edit
                          </div>
                        </SelectItem>
                        <SelectItem value="turn_based">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            Turn-based - Request to edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Session Code */}
        <div className="bg-[#f5f5f7] rounded-lg p-3">
          <p className="text-xs text-[#666666] mb-2">Session Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-white px-3 py-2 rounded border border-[#eeeeee]">
              {session?.session_code}
            </code>
            <Button
              onClick={handleCopyCode}
              size="sm"
              variant="outline"
              className="border-[#eeeeee]"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-[#666666] mt-2">
            Share this code with others to join
          </p>
        </div>

        {/* Active Users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#666666]">Active Users</p>
            {isOwner && (
              <Dialog open={showInvite} onOpenChange={setShowInvite}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowInvite(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvite} className="bg-[#0088cc]">
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeUsers.map((user, index) => {
              const isCurrentUser = user.email === currentUser?.email;
              const isSessionOwner = user.email === session?.owner_email;
              const userColor = user.color || USER_COLORS[index % USER_COLORS.length];

              return (
                <div
                  key={user.email}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors"
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                      style={{ backgroundColor: userColor }}
                    >
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        user.last_active
                      )}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-[#000000] truncate">
                        {user.full_name}
                        {isCurrentUser && (
                          <span className="text-xs text-[#666666]"> (You)</span>
                        )}
                      </p>
                      {isSessionOwner && (
                        <Crown className="w-3 h-3 text-yellow-600" title="Session Owner" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#666666]">
                      {user.selected_object_id ? (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Editing object</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Viewing</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Color indicator */}
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: userColor }}
                  />

                  {isOwner && !isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-600"
                      onClick={() => onKickUser && onKickUser(user.email)}
                    >
                      <Circle className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Mode Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center gap-2 text-xs text-blue-800">
            {editMode === 'free' && <Unlock className="w-3 h-3" />}
            {editMode === 'locked' && <Lock className="w-3 h-3" />}
            {editMode === 'turn_based' && <Edit3 className="w-3 h-3" />}
            <span className="font-medium">
              {editMode === 'free' && 'Free editing enabled'}
              {editMode === 'locked' && 'Only owner can edit'}
              {editMode === 'turn_based' && 'Turn-based editing'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}