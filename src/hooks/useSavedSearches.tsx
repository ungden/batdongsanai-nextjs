"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  alert_enabled: boolean;
  last_alert_sent?: string;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSearches = async () => {
    if (!user) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(((data as any) as SavedSearch[]) || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async (name: string, filters: any, alertEnabled: boolean = true) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu tìm kiếm');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .insert({
          user_id: user.id,
          name,
          filters,
          alert_enabled: alertEnabled
        })
        .select()
        .single();

      if (error) throw error;

      const newSearch = (data as any) as SavedSearch;
      setSavedSearches(prev => [newSearch, ...prev]);
      toast.success('Đã lưu tìm kiếm');
      return newSearch;
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Không thể lưu tìm kiếm');
      throw error;
    }
  };

  const updateSearch = async (id: string, updates: Partial<SavedSearch>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSearch = (data as any) as SavedSearch;
      setSavedSearches(prev =>
        prev.map(s => s.id === id ? updatedSearch : s)
      );
      toast.success('Đã cập nhật');
      return updatedSearch;
    } catch (error) {
      console.error('Error updating search:', error);
      toast.error('Không thể cập nhật');
      throw error;
    }
  };

  const deleteSearch = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_searches' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== id));
      toast.success('Đã xóa tìm kiếm');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Không thể xóa');
      throw error;
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [user]);

  return {
    savedSearches,
    loading,
    saveSearch,
    updateSearch,
    deleteSearch,
    refresh: fetchSavedSearches
  };
};