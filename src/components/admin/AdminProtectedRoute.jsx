import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';

export default function AdminProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check cache first
      const cachedUser = sessionStorage.getItem('current_user');
      const cacheTime = sessionStorage.getItem('user_cache_time');
      
      // Use cache if less than 30 minutes old
      if (cachedUser && cacheTime && Date.now() - parseInt(cacheTime) < 1800000) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          setLoading(false);
          return;
        } catch (e) {
          sessionStorage.removeItem('current_user');
          sessionStorage.removeItem('user_cache_time');
        }
      }

      // Check cooldown
      const lastFailTime = sessionStorage.getItem('user_fetch_fail_time');
      const failCooldown = 600000; // Increased to 10 minutes
      
      if (lastFailTime && Date.now() - parseInt(lastFailTime) < failCooldown) {
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
            setLoading(false);
            return;
          } catch (e) {
            setUser(null);
            setLoading(false);
            return;
          }
        } else {
          setUser(null);
          setLoading(false);
          return;
        }
      }

      try {
        const currentUser = await Promise.race([
          base44.auth.me(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 15000) // Increased to 15 seconds
          )
        ]);
        
        setUser(currentUser);
        sessionStorage.setItem('current_user', JSON.stringify(currentUser));
        sessionStorage.setItem('user_cache_time', Date.now().toString());
        sessionStorage.removeItem('user_fetch_fail_time');
        setLoading(false);
      } catch (error) {
        console.log('Admin auth handled:', error.message);
        sessionStorage.setItem('user_fetch_fail_time', Date.now().toString());
        
        // Try cache
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0088cc] animate-spin mx-auto mb-4" />
          <p className="text-[#666666]">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#666666]">
              Please sign in to access the admin portal.
            </p>
            <Button 
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)} 
              className="w-full bg-[#0088cc] hover:bg-[#0099dd] text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated — but admin routes require the admin role. This is defense in
  // depth on top of server-side RLS, which already blocks non-admin entity
  // reads/writes; it stops non-admins from even loading the admin chrome.
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#666666]">
              Your account does not have admin privileges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return children;
}