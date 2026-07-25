import { supabase } from '@/lib/supabase';
import type { MenuCategory, MenuItem } from '@/types';
import { mockMenuCategories, mockMenuItems } from '@/mocks/menu.mock';

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockMenuCategories;
      }

      return data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
      }));
    } catch {
      return mockMenuCategories;
    }
  },

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockMenuItems;
      }

      return data.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        imageUrl: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        preparationTime: item.preparation_time,
        available: item.available,
        popular: item.popular,
        tags: item.tags || [],
      }));
    } catch {
      return mockMenuItems;
    }
  },

  async toggleAvailability(itemId: string, available: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available })
        .eq('id', itemId);

      return !error;
    } catch {
      return false;
    }
  },
};
