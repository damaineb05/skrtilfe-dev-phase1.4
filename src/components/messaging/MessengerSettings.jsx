import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Palette, 
  Archive,
  Star,
  Download,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function MessengerSettings({ onBack, currentUser }) {
  const [notifications, setNotifications] = useState({
    messages: true,
    calls: true,
    groups: true,
    mentions: true
  });
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    lastSeen: true,
    profilePhoto: 'everyone',
    messageRequests: 'friends'
  });
  const [appearance, setAppearance] = useState({
    theme: 'auto',
    fontSize: 14,
    soundEnabled: true
  });

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Message notifications',
          description: 'Get notified when you receive new messages',
          type: 'toggle',
          key: 'messages',
          value: notifications.messages,
          onChange: (value) => setNotifications(prev => ({ ...prev, messages: value }))
        },
        {
          label: 'Call notifications',
          description: 'Get notified for incoming calls',
          type: 'toggle',
          key: 'calls',
          value: notifications.calls,
          onChange: (value) => setNotifications(prev => ({ ...prev, calls: value }))
        },
        {
          label: 'Group notifications',
          description: 'Get notified for group messages',
          type: 'toggle',
          key: 'groups',
          value: notifications.groups,
          onChange: (value) => setNotifications(prev => ({ ...prev, groups: value }))
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Read receipts',
          description: 'Let others know when you\'ve read their messages',
          type: 'toggle',
          value: privacy.readReceipts,
          onChange: (value) => setPrivacy(prev => ({ ...prev, readReceipts: value }))
        },
        {
          label: 'Last seen',
          description: 'Show when you were last active',
          type: 'toggle',
          value: privacy.lastSeen,
          onChange: (value) => setPrivacy(prev => ({ ...prev, lastSeen: value }))
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Sound effects',
          description: 'Play sounds for messages and calls',
          type: 'toggle',
          value: appearance.soundEnabled,
          onChange: (value) => setAppearance(prev => ({ ...prev, soundEnabled: value }))
        },
        {
          label: 'Font size',
          description: 'Adjust text size in conversations',
          type: 'slider',
          value: [appearance.fontSize],
          min: 12,
          max: 18,
          step: 1,
          onChange: (value) => setAppearance(prev => ({ ...prev, fontSize: value[0] }))
        }
      ]
    }
  ];

  const accountActions = [
    {
      label: 'Archived conversations',
      icon: Archive,
      description: 'View your archived chats',
      onClick: () => {}
    },
    {
      label: 'Starred messages',
      icon: Star,
      description: 'See all your starred messages',
      onClick: () => {}
    },
    {
      label: 'Download data',
      icon: Download,
      description: 'Download a copy of your data',
      onClick: () => {}
    },
    {
      label: 'Help Center',
      icon: HelpCircle,
      description: 'Get help with Messenger',
      onClick: () => window.open('/help', '_blank')
    }
  ];

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b theme-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold theme-text">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        {/* Profile Section */}
        <div className="p-4 border-b theme-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold theme-text">{currentUser?.full_name || 'Unknown User'}</h3>
              <p className="theme-text-secondary text-sm">{currentUser?.email}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Active status: Online
          </Badge>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <div key={section.title} className="p-4 border-b theme-border">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-4 h-4 theme-text-secondary" />
              <h4 className="font-medium theme-text text-sm">{section.title}</h4>
            </div>
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="theme-text text-sm font-medium">{item.label}</p>
                    {item.description && (
                      <p className="theme-text-secondary text-xs mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {item.type === 'toggle' ? (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    ) : item.type === 'slider' ? (
                      <div className="w-20">
                        <Slider
                          value={item.value}
                          onValueChange={item.onChange}
                          max={item.max}
                          min={item.min}
                          step={item.step}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Account Actions */}
        <div className="p-4 border-b theme-border">
          <h4 className="font-medium theme-text text-sm mb-3">Account</h4>
          <div className="space-y-2">
            {accountActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:theme-bg-secondary transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 theme-text-secondary" />
                  <div>
                    <p className="theme-text text-sm">{action.label}</p>
                    <p className="theme-text-secondary text-xs">{action.description}</p>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 theme-text-secondary" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="theme-text-secondary text-xs">
            Skrtlife Messenger • Version 2.0.1
          </p>
          <p className="theme-text-secondary text-xs mt-1">
            Built with security and privacy in mind
          </p>
        </div>
      </div>
    </motion.div>
  );
}