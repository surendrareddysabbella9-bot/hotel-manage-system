import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';
import { mockCurrentUser, mockCustomerUser, mockStaffUser } from '@/mocks/users.mock';

const mockUsers: User[] = [mockCurrentUser, mockStaffUser, mockCustomerUser];

export const authService = {
  async getCurrentProfile(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return null;
      }

      const user = session.user;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) {
        return {
          id: user.id,
          email: user.email || 'user@restaurantos.app',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Restaurant User',
          avatarUrl: user.user_metadata?.avatar_url,
          role: (user.user_metadata?.role as UserRole) || 'customer',
          createdAt: user.created_at || new Date().toISOString(),
        };
      }

      const roleName = profile.roles?.name?.toLowerCase();
      const mappedRole: UserRole = roleName === 'admin' ? 'admin' : roleName === 'staff' || roleName === 'chef' || roleName === 'waiter' || roleName === 'manager' || roleName === 'cashier' ? 'staff' : 'customer';

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        role: mappedRole,
        createdAt: profile.created_at,
      };
    } catch {
      return null;
    }
  },

  async loginWithRole(role: UserRole): Promise<User> {
    const mockMatch = mockUsers.find((u: User) => u.role === role) || mockUsers[0];
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: mockMatch.email,
        password: 'Password123!',
      });

      if (!error && data.user) {
        const profile = await this.getCurrentProfile();
        if (profile) return profile;
      }
    } catch (e) {
      console.warn('Supabase auth fallback to local role persona:', e);
    }
    return mockMatch;
  },

  async loginWithGoogle(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Logout warning:', e);
    }
  },
};
