import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, ExternalLink } from 'lucide-react';

export default function MemberMatchmaking({ currentUser }) {
  const [suggestedMembers, setSuggestedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      findMatches();
    }
  }, [currentUser]);

  const findMatches = async () => {
    try {
      // Get user's activity to understand interests
      const userActivity = await base44.entities.UserActivity.filter(
        { user_email: currentUser.email },
        '-created_date',
        30
      );

      // Extract interest signals
      const interestTags = new Set();
      userActivity.forEach(activity => {
        if (activity.metadata?.tags) {
          activity.metadata.tags.forEach(tag => interestTags.add(tag));
        }
      });

      // Get user preferences to exclude already followed members
      const [preferences] = await base44.entities.UserPreferences.filter(
        { user_email: currentUser.email },
        '-created_date',
        1
      );

      const followedMembers = preferences?.followed_members || [];

      // Find members with similar activity patterns
      const allMembers = await base44.entities.User.list('-created_date', 50);
      
      const scored = [];
      for (const member of allMembers) {
        if (member.email === currentUser.email) continue;
        if (followedMembers.includes(member.email)) continue;

        // Get their activity
        const theirActivity = await base44.entities.UserActivity.filter(
          { user_email: member.email },
          '-created_date',
          20
        );

        // Calculate simple match score
        let matchScore = 0;
        theirActivity.forEach(activity => {
          if (activity.metadata?.tags) {
            activity.metadata.tags.forEach(tag => {
              if (interestTags.has(tag)) matchScore++;
            });
          }
        });

        if (matchScore > 0) {
          scored.push({ member, score: matchScore });
        }
      }

      // Sort and limit to 6 max
      const matches = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(s => s.member);

      setSuggestedMembers(matches);
    } catch (error) {
      console.error('Failed to find member matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#FF3366]" />
          <h2 className="text-white font-black text-lg uppercase tracking-wider">Member Matches</h2>
        </div>
        <p className="text-white/40 text-xs">Similar interests</p>
      </div>

      {suggestedMembers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">Explore the society to find members</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
            {suggestedMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <Link to={createPageUrl('ProfileHub') + `?user=${member.email}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-[#FF3366]/20 to-[#00D4FF]/20 border border-white/10 group-hover:border-[#FF3366]/50 transition-all">
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-black">
                        {member.full_name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                    </div>
                    <p className="text-white text-xs font-medium truncate group-hover:text-[#FF3366] transition-colors text-center">
                      {member.full_name?.split(' ')[0] || 'Member'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-white/10">
            <Link to={createPageUrl('SocialHub')} className="text-[#FF3366] text-xs hover:text-white transition-colors flex items-center gap-1 justify-center">
              View Social Hub <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}