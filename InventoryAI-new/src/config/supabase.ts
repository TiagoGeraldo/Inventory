import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://nculpmsbyjrxmunwwvuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdWxwbXNieWpyeG11bnd3dnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMTcxNjQsImV4cCI6MjA1NDU5MzE2NH0.IgLhxC-nXcCjRZYMO0ZOh6ot9ETJMd8ioJBu1isIrSg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 