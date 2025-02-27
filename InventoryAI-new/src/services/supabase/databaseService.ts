import { supabase } from './supabaseClient';
import { User } from '../../types';

export class DatabaseService {
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // First try to get existing profile
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        return null;
      }

      if (!profile) {
        // Profile doesn't exist, create it
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser?.user) {
          console.error('Error getting auth user:', authError);
          return null;
        }

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return newProfile;
      }

      return profile;
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      return null;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (err) {
      console.error('Error in updateLastLogin:', err);
    }
  }
}

export const databaseService = new DatabaseService(); 