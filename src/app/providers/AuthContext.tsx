import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '@/types';
import { authService } from '@/services/authService';


interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, securityQuestion: string, securityAnswer: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (guestName: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch current profile on mount (check both localStorage and sessionStorage)
    const loadUser = async () => {
      try {
        // Check for guest session first
        const guestToken = sessionStorage.getItem('guest_token');
        if (guestToken) {
          try {
            const payload = JSON.parse(atob(guestToken.split('.')[1]));
            // Put guest token in localStorage temporarily so apiFetch can use it
            localStorage.setItem('token', guestToken);
            setUser({
              id: payload.id,
              email: payload.email,
              fullName: payload.fullName,
              role: 'guest',
              createdAt: payload.createdAt
            });
            return;
          } catch {
            sessionStorage.removeItem('guest_token');
          }
        }

        // Normal auth profile fetch
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
    role: UserRole,
    securityQuestion: string,
    securityAnswer: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signUp(email, password, fullName, role, securityQuestion, securityAnswer);
      // Clear any guest session
      sessionStorage.removeItem('guest_token');
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
      // Clear any guest session
      sessionStorage.removeItem('guest_token');
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const loginAsGuest = async (guestName: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.loginAsGuest(guestName);
      // Store guest token in sessionStorage (dies when tab closes)
      sessionStorage.setItem('guest_token', response.token);
      // Also put in localStorage so apiFetch can use it
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    sessionStorage.removeItem('guest_token');
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isLoading,
        isGuest: user?.role === 'guest',
        signUp,
        loginWithEmail,
        loginWithGoogle,
        loginAsGuest,
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
