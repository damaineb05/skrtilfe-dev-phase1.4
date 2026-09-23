import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Save, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationSettings({ currentUser }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    followed_creators_drops: true,
    saved_items_restock: true,
    new_limited_drops: false,
    member_matches: false,
    weekly_digest: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSettings();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    try {
      const [prefs] = await base44.entities.UserPreferences.filter(
        { user_email: currentUser.email },
        '-created_date',
        1
      );

      if (prefs?.notification_settings) {
        setSettings(prefs.notification_settings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleToggle = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const [existing] = await base44.entities.UserPreferences.filter(
        { user_email: currentUser.email },
        '-created_date',
        1
      );

      if (existing) {
        await base44.entities.UserPreferences.update(existing.id, {
          notification_settings: settings
        });
      } else {
        await base44.entities.UserPreferences.create({
          user_email: currentUser.email,
          notification_settings: settings
        });
      }

      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: 'followed_creators_drops',
      label: 'Followed Creator Drops',
      description: 'Get notified when creators you follow release new items'
    },
    {
      key: 'saved_items_restock',
      label: 'Saved Items Restock',
      description: 'Notify when saved items are back in stock'
    },
    {
      key: 'new_limited_drops',
      label: 'New Limited Drops',
      description: 'Alerts for limited edition releases'
    },
    {
      key: 'member_matches',
      label: 'Member Matches',
      description: 'Suggestions for members with similar interests'
    },
    {
      key: 'weekly_digest',
      label: 'Weekly Digest',
      description: 'Summary of society activity once per week'
    }
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00D4FF]" />
          <h2 className="text-white font-black text-lg uppercase tracking-wider">Notifications</h2>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-start justify-between py-3 border-b border-white/10 last:border-0">
            <div className="flex-1 pr-4">
              <Label htmlFor={option.key} className="text-white text-sm font-medium cursor-pointer">
                {option.label}
              </Label>
              <p className="text-white/40 text-xs mt-1">{option.description}</p>
            </div>
            <Switch
              id={option.key}
              checked={settings[option.key]}
              onCheckedChange={(value) => handleToggle(option.key, value)}
            />
          </div>
        ))}
      </div>

      {hasChanges && (
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      )}

      {!hasChanges && (
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm py-3">
          <Check className="w-4 h-4" />
          <span>All changes saved</span>
        </div>
      )}
    </div>
  );
}