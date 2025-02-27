export const APP_NAME = 'InventoryAI';

export const SUPABASE_CONFIG = {
  // These will be filled with actual values later
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

export const DEEPSEEK_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
}; 