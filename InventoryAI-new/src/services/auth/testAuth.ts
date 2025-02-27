import { supabase } from '../supabase/supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth test:', { authData, authError });

    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .select('count')
      .single();
    console.log('Database test:', { dbData, dbError });

    if (authError) {
      console.error('Auth connection failed:', authError);
      return false;
    }

    if (dbError) {
      console.error('Database connection failed:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
} 