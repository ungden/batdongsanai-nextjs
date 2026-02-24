"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  project_id: string;
  project_name: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (projectId: string, projectName: string) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng yêu thích",
        variant: "destructive"
      });
      return;
    }

    const existingFavorite = favorites.find(f => f.project_id === projectId);

    try {
      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);

        if (error) throw error;

        setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        toast({
          title: "Đã bỏ yêu thích",
          description: `Đã xóa ${projectName} khỏi danh sách yêu thích`,
        });
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            project_id: projectId,
            project_name: projectName
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [data, ...prev]);
        toast({
          title: "Đã thêm yêu thích",
          description: `Đã thêm ${projectName} vào danh sách yêu thích`,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật yêu thích",
        variant: "destructive"
      });
    }
  };

  const isFavorite = (projectId: string) => {
    return favorites.some(f => f.project_id === projectId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};
