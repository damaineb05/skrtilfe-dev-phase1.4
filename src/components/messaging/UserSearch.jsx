import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/entities/User';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users, UserPlus } from 'lucide-react';

export default function UserSearch({ onUserSelect, currentUserEmail }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await UserEntity.list('-created_date', 50);
        // Filter out current user
        const otherUsers = allUsers.filter(user => user.email !== currentUserEmail);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [currentUserEmail]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  return (
    <div className="h-full flex flex-col">
      {/* Search Input */}
      <div className="flex-shrink-0 p-3 border-b theme-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-secondary" />
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 theme-input theme-border rounded-full"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm theme-text-secondary">Loading people...</p>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => onUserSelect(user)}
                className="p-3 flex items-center gap-3 cursor-pointer rounded-xl hover:theme-bg-muted transition-colors"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.profile_image_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=faces`} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-grow">
                  <h4 className="font-semibold theme-text">
                    {user.full_name || 'Anonymous User'}
                  </h4>
                  <p className="text-sm theme-text-secondary">{user.email}</p>
                  {user.bio && (
                    <p className="text-xs theme-text-secondary truncate mt-1">{user.bio}</p>
                  )}
                </div>

                {/* Action Button */}
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <Users className="w-16 h-16 theme-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold theme-text mb-2">
                {searchTerm ? 'No users found' : 'No users available'}
              </h3>
              <p className="theme-text-secondary text-sm">
                {searchTerm 
                  ? `No users match "${searchTerm}". Try a different search term.`
                  : 'There are no other users to chat with at the moment.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}