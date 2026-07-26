import type { User, UserRole } from '@/types';
import { apiFetch } from '@/lib/api';

export const authService = {
  async getCurrentProfile(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await apiFetch('/auth/me');
      return response.user;
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        return null;
      }
      
      // If it's a network error (no status) or 500, try to decode the token to preserve session
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          createdAt: payload.createdAt
        };
      } catch (e) {
        localStorage.removeItem('token');
        return null;
      }
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
