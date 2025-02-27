import { User } from '../../types';

export interface AuthService {
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

// This will be implemented with Supabase later
export const createAuthService = (): AuthService => {
  return {
    login: async () => {
      throw new Error('Not implemented');
    },
    register: async () => {
      throw new Error('Not implemented');
    },
    logout: async () => {
      throw new Error('Not implemented');
    },
    getCurrentUser: async () => {
      return null;
    },
  };
}; 