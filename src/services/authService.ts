import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

export const authService = {
  async getProfileByUserId(userId: string): Promise<User | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) return null;

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
  },

  async getCurrentProfile(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userProfile = await this.getProfileByUserId(session.user.id);
      if (userProfile) return userProfile;
    }

    // Fallback: Query first active profile from Supabase database if no active session
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .limit(1)
      .maybeSingle();

    if (!profile) return null;

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
  },

  async loginWithEmailPassword(email: string, password?: string): Promise<User> {
    // 1. Attempt Supabase Auth login if password is provided
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const profile = await this.getProfileByUserId(data.user.id);
        if (profile) return profile;
      }
    }

    // 2. Query Supabase profiles table directly to verify profile & role
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('email', email)
      .maybeSingle();

    if (dbError || !profile) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

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
  },

  async loginWithGoogle(): Promise<void> {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
