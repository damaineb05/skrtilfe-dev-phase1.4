import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Save } from "lucide-react";
import ProtectedRoute from '../components/auth/ProtectedRoute';

function SettingsContent() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="display text-3xl text-white">Settings</h1>
          <p className="text-muted">Manage your account and preferences.</p>
        </header>

        <div className="space-y-8">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-5 h-5 text-accent-cyan" />
                Public Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Username</label>
                <Input defaultValue="genesis-user" className="bg-white text-black" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Bio</label>
                <Input defaultValue="Digital creator, streetwear enthusiast." className="bg-white text-black" />
              </div>
              <Button className="btn-primary"><Save className="w-4 h-4 mr-2" />Save Profile</Button>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent-cyan" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Email me about new drops</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Get notified on new community posts</span>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent-cyan" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="neon-border text-cyan-400 hover:bg-cyan-400/10">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
    return <ProtectedRoute><SettingsContent /></ProtectedRoute>
}