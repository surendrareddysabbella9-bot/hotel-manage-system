import { apiFetch } from '@/lib/api';

export const aiService = {
  async getRecommendations(cartItems: any[]) {
    return apiFetch('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ cartItems })
    });
  },

  async getAnalytics() {
    return apiFetch('/ai/analytics');
  }
};
