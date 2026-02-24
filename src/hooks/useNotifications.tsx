"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: 'price_alert' | 'new_project' | 'consultation_update' | 'system' | 'appointment';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = (data as any) as Notification[];
      setNotifications(typedData || []);
      setUnreadCount(typedData?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Không thể cập nhật trạng thái thông báo');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể cập nhật thông báo');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);

      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
      toast.success('Đã xóa tất cả thông báo');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  // Create notification (for testing or admin)
  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'read' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .insert({
          user_id: user.id,
          ...notification
        })
        .select()
        .single();

      if (error) throw error;

      const newNotification = (data as any) as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast.info(newNotification.title, {
            description: newNotification.message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
    refresh: fetchNotifications
  };
};