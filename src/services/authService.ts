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

  async signUp(email: string, password: string, fullName: string, role: UserRole): Promise<User> {
    // 1. Send signup request to Supabase Auth (POST /auth/v1/signup)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Registration failed. No user returned from Supabase Auth.");
    }

    // 2. Fetch matching role_id from roles table
    const targetRoleName = role === 'admin' ? 'admin' : role === 'staff' ? 'waiter' : 'Customer';
    const { data: roleRecord } = await supabase
      .from('roles')
      .select('id')
      .ilike('name', targetRoleName)
      .maybeSingle();

    const defaultCustomerRoleId = '78a5ebd2-acf3-4276-b5a0-4a6c2e88a1ec';
    const roleId = roleRecord?.id || defaultCustomerRoleId;

    // 3. Insert user profile into public.profiles table
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        role_id: roleId,
        email: email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    return {
      id: data.user.id,
      email: email,
      fullName: fullName,
      role: role,
      createdAt: data.user.created_at || new Date().toISOString(),
    };
  },

  async loginWithEmailPassword(email: string, password?: string): Promise<User> {
    // 1. Attempt Supabase Auth login if password is provided
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const profile = await this.getProfileByUserId(data.user.id);
        if (profile) return profile;
      }
    }

    // 2. Fallback query to public.profiles table directly if password is not supplied
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
