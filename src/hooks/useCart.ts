import { useState, useEffect } from "react";

export interface CartItem {
  id: string; // use menuItem id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

let memoryCart: CartItem[] = [];

// Try to load from local storage
try {
  const saved = localStorage.getItem("restaurant_cart");
  if (saved) {
    // Force cast price to Number to recover from previous buggy string state
    memoryCart = JSON.parse(saved).map((item: any) => ({
      ...item,
      price: Number(item.price) || 0
    }));
  }
} catch (e) {
  console.error("Failed to load cart from local storage", e);
}

const listeners = new Set<() => void>();

function notifyListeners() {
  try {
    localStorage.setItem("restaurant_cart", JSON.stringify(memoryCart));
  } catch (e) {
    console.error("Failed to save cart to local storage", e);
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  getCart: () => memoryCart,
  addItem: (item: Omit<CartItem, "quantity">) => {
    const existing = memoryCart.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
      memoryCart = [...memoryCart];
    } else {
      memoryCart = [...memoryCart, { ...item, quantity: 1 }];
    }
    notifyListeners();
  },
  updateQuantity: (id: string, delta: number) => {
    memoryCart = memoryCart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    notifyListeners();
  },
  removeItem: (id: string) => {
    memoryCart = memoryCart.filter((item) => item.id !== id);
    notifyListeners();
  },
  clearCart: () => {
    memoryCart = [];
    notifyListeners();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(cartStore.getCart());

  useEffect(() => {
    return cartStore.subscribe(() => {
      setCart(cartStore.getCart());
    });
  }, []);

  return {
    cart,
    addToCart: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
  };
}
