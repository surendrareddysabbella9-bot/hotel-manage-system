import type { MenuCategory, MenuItem } from '@/types';
import { apiFetch } from '@/lib/api';

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    const data = await apiFetch('/menu_categories?order=display_order.asc');
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || undefined,
    }));
  },

  async getMenuItems(): Promise<MenuItem[]> {
    // In a real custom backend you would join menu_categories, but for now we'll do it manually 
    // or just rely on the IDs if the UI doesn't strictly need the joined category name
    const data = await apiFetch('/menu_items?order=created_at.desc');

    return data.map((item: any) => ({
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
    try {
      await apiFetch(`/menu_items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ available })
      });
      return true;
    } catch {
      return false;
    }
  },

  async createMenuItem(newItem: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const data = await apiFetch('/menu_items', {
      method: 'POST',
      body: JSON.stringify({
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
    });

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
