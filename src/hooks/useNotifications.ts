import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import type { Notification } from '@/types';
import { useAuth } from '@/app/providers/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const addNotification = (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notif,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    // Listen for new orders (relevant for Admin/Staff)
    const handleOrderCreated = (order: any) => {
      if (user.role === 'admin' || user.role === 'staff') {
        addNotification({
          title: 'New Order Received',
          message: `Order #${order.order_number || order.orderNumber} placed for Table ${order.table_id || 'Takeout'}`,
          type: 'info'
        });
      }
    };

    // Listen for order updates (relevant for Customer, Admin, Staff)
    const handleOrderUpdated = (order: any) => {
      // If customer, only notify if it's their order
      if (user.role === 'customer' && order.customer_id !== user.id) {
        return;
      }
      
      let type: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (order.status === 'ready') type = 'success';
      if (order.status === 'cancelled') type = 'error';
      if (order.status === 'cooking') type = 'warning';

      addNotification({
        title: 'Order Status Updated',
        message: `Order #${order.order_number || order.orderNumber} is now ${order.status}`,
        type
      });
    };

    // Listen for inventory alerts (relevant for Admin/Staff)
    const handleInventoryUpdated = (data: any) => {
      if (user.role === 'admin' || user.role === 'staff') {
        addNotification({
          title: 'Inventory Alert',
          message: data.message || 'Inventory levels have changed',
          type: 'warning'
        });
      }
    };

    socket.on('orders_created', handleOrderCreated);
    socket.on('orders_updated', handleOrderUpdated);
    socket.on('inventory_updated', handleInventoryUpdated);

    return () => {
      socket.off('orders_created', handleOrderCreated);
      socket.off('orders_updated', handleOrderUpdated);
      socket.off('inventory_updated', handleInventoryUpdated);
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return {
    notifications,
    markAllAsRead
  };
}
