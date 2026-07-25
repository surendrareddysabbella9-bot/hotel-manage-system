import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://krcrhekmjugragjqujwl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kTauu76E-cy-eZgytBvOpQ_LujLpjmR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('[Supabase Health Check] Query failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Health Check] Connected successfully. Fetched role row:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase Health Check] Connection error:', err);
    return { success: false, error: err };
  }
};

// Run health check automatically on browser load
if (typeof window !== 'undefined') {
  checkSupabaseHealth();
}
