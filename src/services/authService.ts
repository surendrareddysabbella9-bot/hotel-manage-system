import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

export const authService = {
  async getCurrentProfile(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .limit(1)
        .maybeSingle();

      if (data) {
        const rawRole = (data.roles?.name || '').toString().toLowerCase();
        const roleVal: UserRole =
          rawRole === 'admin' || rawRole === 'manager'
            ? 'admin'
            : rawRole === 'customer'
            ? 'customer'
            : 'staff';

        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: roleVal,
          avatarUrl: data.avatar_url || undefined,
          createdAt: data.created_at,
        };
      }
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', user.id)
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

  async loginWithEmail(email: string): Promise<User> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('email', email)
      .maybeSingle();

    if (profile) {
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

    return {
      id: `user-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'customer',
      createdAt: new Date().toISOString(),
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
