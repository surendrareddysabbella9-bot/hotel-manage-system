import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  loginWithRole: (role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch from Supabase database
    authService.getCurrentProfile().then((profile) => {
      if (profile) {
        setUser(profile);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await authService.getCurrentProfile();
        if (profile) setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithRole = async (role: UserRole) => {
    setIsLoading(true);
    const u = await authService.loginWithRole(role);
    setUser(u);
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'admin',
        isLoading,
        loginWithRole,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
