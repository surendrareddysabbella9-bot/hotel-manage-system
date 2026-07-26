import type { User, UserRole } from '@/types';
import { apiFetch } from '@/lib/api';

export const authService = {
  // Returns the currently authenticated user's profile, or null if not logged in.
  async getCurrentProfile(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await apiFetch('/auth/me');
      return response.user;
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, fullName: string, role: UserRole): Promise<User> {
    const response = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role })
    });
    
    // Store token
    localStorage.setItem('token', response.token);
    return response.user;
  },

  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Store token
    localStorage.setItem('token', response.token);
    return response.user;
  },

  async loginWithGoogle(): Promise<void> {
    throw new Error('Google Login is not supported in the custom backend yet.');
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },
};
