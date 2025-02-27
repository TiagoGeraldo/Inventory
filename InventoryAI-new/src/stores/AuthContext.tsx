import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { SupabaseAuthService } from '../services/auth/supabaseAuthService';
import { databaseService } from '../services/supabase/databaseService';
import { router } from 'expo-router';
import { supabase } from '../services/supabase/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authService = new SupabaseAuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    checkUser();
  }, []);

  useEffect(() => {
    console.log('Auth state changed:', { user, loading });
    // Handle navigation based on auth state
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to dashboard');
        router.replace('/(main)/dashboard');
      } else {
        console.log('No user, staying on login');
        // Only redirect to login if we're not already on a login/register page
        if (!router.canGoBack()) {
          router.replace('/(auth)/login');
        }
      }
    }
  }, [user, loading]);

  const checkUser = async () => {
    console.log('Checking user...');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const profile = await databaseService.getUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
          await databaseService.updateLastLogin(session.user.id);
        } else {
          console.error('No profile found for user');
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email });
    const user = await authService.login(email, password);
    console.log('Login successful, getting profile...');
    const profile = await databaseService.getUserProfile(user.id);
    console.log('Got profile:', profile);
    if (profile) {
      setUser(profile);
      await databaseService.updateLastLogin(user.id);
    }
  };

  const register = async (email: string, password: string) => {
    const user = await authService.register(email, password);
    const profile = await databaseService.getUserProfile(user.id);
    if (profile) {
      setUser(profile);
      await databaseService.updateLastLogin(user.id);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 