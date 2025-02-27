import { supabase } from '../supabase/supabaseClient';
import { AuthService } from './authService';
import { User } from '../../types';

export class SupabaseAuthService implements AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      return {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        last_login: new Date().toISOString(),
        settings: {},
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: 'inventoryai://login',
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from registration');

      return {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        last_login: new Date().toISOString(),
        settings: {},
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        last_login: new Date().toISOString(),
        settings: {},
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
} 