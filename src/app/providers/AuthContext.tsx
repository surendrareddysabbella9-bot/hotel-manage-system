import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch current profile on mount
    const loadUser = async () => {
      try {
        const profile = await authService.getCurrentProfile();
        setUser(profile);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signUp(email, password, fullName, role);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await authService.loginWithEmailPassword(email, password);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
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
        role: user?.role || 'customer',
        isLoading,
        signUp,
        loginWithEmail,
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
