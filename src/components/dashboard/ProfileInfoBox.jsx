import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit2, Eye, Crown, MapPin, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileInfoBox({ user, onEditProfile }) {
  if (!user) {
    return null;
  }

  const userInitial = user.full_name ? user.full_name.charAt(0).toUpperCase() : '?';

  return (
    <Card className="card">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-12 w-12">
                <AvatarImage src={user.profile_image_url} alt={user.full_name} />
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle>{user.full_name || 'Anonymous User'}</CardTitle>
                <div className="flex items-center text-sm text-gray-400 gap-4 mt-1">
                    {user.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.location}</span>}
                    {user.website_url && <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400"><LinkIcon className="w-3 h-3"/> Website</a>}
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
            <p className="text-sm text-gray-400">
            {user.bio || "No bio yet. Add a short description to your profile."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
                <Link to={createPageUrl("GenesisHub")} className="w-full">
                    <Button variant="outline" className="w-full neon-border text-cyan-400 hover:bg-cyan-400/10 justify-start">
                        <Crown className="w-4 h-4 mr-3" />
                        Genesis Hub
                    </Button>
                </Link>
                <Button variant="outline" className="w-full neon-border text-cyan-400 hover:bg-cyan-400/10 justify-start" onClick={onEditProfile}>
                    <Edit2 className="w-4 h-4 mr-3" />
                    Edit Profile
                </Button>
                <Button variant="outline" className="w-full neon-border text-cyan-400 hover:bg-cyan-400/10 justify-start">
                    <Eye className="w-4 h-4 mr-3" />
                    View Public Profile
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}