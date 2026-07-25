import { supabase } from '@/lib/supabase';
import type { MenuCategory, MenuItem } from '@/types';

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch menu categories');
    }

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || undefined,
    }));
  },

  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_categories(id, name, slug)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch menu items');
    }

    return data.map((item) => ({
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
  },

  async toggleAvailability(itemId: string, available: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('menu_items')
      .update({ available })
      .eq('id', itemId);

    return !error;
  },

  async createMenuItem(newItem: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        category_id: newItem.categoryId,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        image_url: newItem.imageUrl,
        preparation_time: newItem.preparationTime,
        available: newItem.available,
        popular: newItem.popular || false,
        tags: newItem.tags,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create menu item');
    }

    return {
      id: data.id,
      categoryId: data.category_id,
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      imageUrl: data.image_url || newItem.imageUrl,
      preparationTime: data.preparation_time,
      available: data.available,
      popular: data.popular,
      tags: data.tags || [],
    };
  },
};
