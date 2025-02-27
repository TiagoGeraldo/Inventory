export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

// Validate environment variables
Object.entries(ENV).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
  }
}); 