import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

// Maps a raw DB profile row (with joined roles) to our frontend User type
function mapProfileToUser(profile: {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  roles?: { name: string } | null;
}): User {
  const rawRole = (profile.roles?.name || '').toString().toLowerCase();
  const roleVal: UserRole =
    rawRole === 'admin' || rawRole === 'manager'
      ? 'admin'
      : rawRole === 'customer'
      ? 'customer'
      : 'staff';

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: roleVal,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at,
  };
}

export const authService = {
  async getProfileByUserId(userId: string): Promise<User | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) return null;
    return mapProfileToUser(profile);
  },

  // Returns the currently authenticated user's profile, or null if not logged in.
  // DOES NOT fall back to querying random profiles — that caused fake login states.
  async getCurrentProfile(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return await this.getProfileByUserId(session.user.id);
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, fullName: string, role: UserRole): Promise<User> {
    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed. No user returned.');

    // 2. Find the matching role_id
    const targetRoleName =
      role === 'admin' ? 'Admin' : role === 'staff' ? 'Waiter' : 'Customer';

    const { data: roleRecord } = await supabase
      .from('roles')
      .select('id')
      .ilike('name', targetRoleName)
      .maybeSingle();

    // 3. Fetch the Customer role as fallback
    let roleId = roleRecord?.id;
    if (!roleId) {
      const { data: fallbackRole } = await supabase
        .from('roles')
        .select('id')
        .ilike('name', 'Customer')
        .maybeSingle();
      roleId = fallbackRole?.id;
    }

    if (!roleId) throw new Error('No roles found in database. Please run the seed SQL first.');

    // 4. Upsert profile
    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        role_id: roleId,
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      console.error('Profile upsert error:', upsertError.message);
      // Don't throw — auth user was created successfully, profile will be created by trigger
    }

    return {
      id: data.user.id,
      email,
      fullName,
      role,
      createdAt: data.user.created_at || new Date().toISOString(),
    };
  },

  // Sign in with email + password using Supabase Auth ONLY.
  // Removed the unsafe DB fallback that bypassed password checking entirely.
  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map common Supabase error messages to user-friendly text
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email before signing in. Check your inbox.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      throw new Error(error.message);
    }

    if (!data.user) throw new Error('Login failed. No user returned.');

    const profile = await this.getProfileByUserId(data.user.id);
    if (!profile) {
      // Profile doesn't exist yet — create it now
      const { data: customerRole } = await supabase
        .from('roles')
        .select('id')
        .ilike('name', 'Customer')
        .maybeSingle();

      if (customerRole?.id) {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            role_id: customerRole.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      }
      // Retry fetching profile
      const retried = await this.getProfileByUserId(data.user.id);
      if (!retried) throw new Error('Profile not found. Contact support.');
      return retried;
    }

    return profile;
  },

  async loginWithGoogle(): Promise<void> {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
