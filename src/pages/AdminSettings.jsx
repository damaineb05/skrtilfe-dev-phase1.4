import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, 
  Save,
  Building, RefreshCw
} from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { SiteContent } from '@/entities/SiteContent';
import { User as UserEntity } from '@/entities/User';

function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState('organization');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Organization Settings
    brandName: 'Skrtlife',
    brandDescription: 'Digital Society',
    primaryColor: '#007aff',
    logoUrl: '',
    faviconUrl: '',
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'es-ES', 'fr-FR'],
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    timezone: 'America/New_York',
    
    // Notifications
    emailNotifications: {
      orderConfirmation: true,
      paymentReceived: true,
      lowStock: true,
      newUser: true,
      systemAlerts: true,
    },
    smsNotifications: {
      orderUpdates: false,
      criticalAlerts: true,
    },
    webhooks: [],
    
    // Integrations
    stripe: {
      publicKey: '',
      secretKey: '',
      enabled: false,
    },
    shippo: {
      apiKey: '',
      enabled: false,
    },
    alchemy: {
      apiKey: '',
      network: 'mainnet',
      enabled: false,
    },
    walletConnect: {
      projectId: '',
      enabled: false,
    },
    
    // API Keys
    apiKeys: [],
    
    // Feature Flags
    features: {
      nftMarketplace: true,
      avatarCustomization: true,
      socialFeatures: true,
      blockchainIntegration: false,
      premiumFeatures: false,
    },
    
    // Security
    twoFactorRequired: false,
    passwordMinLength: 8,
    sessionTimeout: 24,
    
    // Content Bindings
    contentBindings: {
      aboutPage: '',
      eventsPage: '',
      communityPage: '',
    }
  });

  const [users, setUsers] = useState([]);
  const [roles] = useState(['admin', 'user', 'creator', 'moderator']);
  const [showApiKey, setShowApiKey] = useState({});

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from SiteContent entity
      const contentData = await SiteContent.list();
      const settingsContent = contentData.find(item => item.content_key === 'admin_settings');
      
      if (settingsContent) {
        setSettings(prev => ({ ...prev, ...JSON.parse(settingsContent.value) }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const userData = await UserEntity.list('-created_date', 100);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to SiteContent entity
      const settingsData = {
        content_key: 'admin_settings',
        content_type: 'json',
        title: 'Admin Settings',
        value: JSON.stringify(settings),
        placement: 'admin',
        is_active: true
      };

      const existing = await SiteContent.list();
      const existingSettings = existing.find(item => item.content_key === 'admin_settings');

      if (existingSettings) {
        await SiteContent.update(existingSettings.id, settingsData);
      } else {
        await SiteContent.create(settingsData);
      }

      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await UserEntity.update(userId, { role: newRole });
      await loadUsers();
      console.log('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: 'New API Key',
      key: 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      permissions: ['read'],
      created_at: new Date().toISOString(),
      last_used: null
    };
    setSettings(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));
  };

  const addWebhook = () => {
    const newWebhook = {
      id: Date.now(),
      url: '',
      events: ['order.created'],
      enabled: true,
      secret: Math.random().toString(36).substring(2, 15)
    };
    setSettings(prev => ({
      ...prev,
      webhooks: [...prev.webhooks, newWebhook]
    }));
  };

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold theme-text">Settings</h1>
            <p className="theme-text-secondary mt-1">
              Configure your application settings and integrations
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="theme-button">
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 theme-bg-card">
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 theme-text">
                  <Building className="w-5 h-5" />
                  Organization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="theme-text">Brand Name</Label>
                    <Input
                      value={settings.brandName}
                      onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                      className="theme-input"
                    />
                  </div>
                  <div>
                    <Label className="theme-text">Primary Color</Label>
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="theme-input h-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="theme-text">Brand Description</Label>
                  <Textarea
                    value={settings.brandDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, brandDescription: e.target.value }))}
                    className="theme-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="theme-text">Default Currency</Label>
                    <Select 
                      value={settings.defaultCurrency} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCurrency: value }))}
                    >
                      <SelectTrigger className="theme-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="theme-bg-card theme-border">
                        {settings.supportedCurrencies.map(currency => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="theme-text">Default Locale</Label>
                    <Select 
                      value={settings.defaultLocale} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLocale: value }))}
                    >
                      <SelectTrigger className="theme-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="theme-bg-card theme-border">
                        {settings.supportedLocales.map(locale => (
                          <SelectItem key={locale} value={locale}>{locale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="theme-text">Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="theme-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="theme-bg-card theme-border">
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Bindings Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 theme-text">
                  <Globe className="w-5 h-5" />
                  Page Content Bindings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="theme-text">About Page Content Source</Label>
                    <Input
                      value={settings.contentBindings.aboutPage}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contentBindings: { ...prev.contentBindings, aboutPage: e.target.value }
                      }))}
                      placeholder="Content key for About page"
                      className="theme-input"
                    />
                  </div>
                  
                  <div>
                    <Label className="theme-text">Events Page Content Source</Label>
                    <Input
                      value={settings.contentBindings.eventsPage}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contentBindings: { ...prev.contentBindings, eventsPage: e.target.value }
                      }))}
                      placeholder="Content key for Events page"
                      className="theme-input"
                    />
                  </div>
                  
                  <div>
                    <Label className="theme-text">Community Page Content Source</Label>
                    <Input
                      value={settings.contentBindings.communityPage}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contentBindings: { ...prev.contentBindings, communityPage: e.target.value }
                      }))}
                      placeholder="Content key for Community page"
                      className="theme-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users & Roles Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 theme-text">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 10).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 theme-bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium theme-text">{user.full_name || 'Anonymous'}</p>
                          <p className="text-sm theme-text-secondary">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}>
                          {user.role || 'user'}
                        </Badge>
                        <Select 
                          value={user.role || 'user'} 
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32 theme-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="theme-bg-card theme-border">
                            {roles.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default function AdminSettings() {
  return (
    <AdminProtectedRoute>
      <AdminSettingsContent />
    </AdminProtectedRoute>
  );
}