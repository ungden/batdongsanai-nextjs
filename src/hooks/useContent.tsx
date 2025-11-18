import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  type: 'page' | 'banner' | 'announcement' | 'seo' | 'news';
  title: string;
  content: string | null;
  slug: string | null;
  status: 'active' | 'draft' | 'archived';
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  featured_image: string | null;
  priority: number | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SiteSetting {
  id: string;
  section: string;
  key: string;
  value: any;
  description: string | null;
  is_public: boolean;
  updated_at: string;
}

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
}

interface Menu {
  id: string;
  name: string;
  location: string;
  items: any[];
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useContent = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchContentItems(),
        fetchSiteSettings(),
        fetchMediaFiles(),
        fetchMenus()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContentItems((data || []) as ContentItem[]);
    } catch (error) {
      console.error('Error fetching content items:', error);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('section, key');

      if (error) throw error;
      setSiteSettings(data || []);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error fetching media files:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('name');

      if (error) throw error;
      setMenus((data || []).map(menu => ({
        ...menu,
        items: Array.isArray(menu.items) ? menu.items : []
      })) as Menu[]);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const createContentItem = async (item: Partial<ContentItem>) => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .insert(item as any)
        .select()
        .single();

      if (error) throw error;

      await fetchContentItems();
      toast({
        title: "Thành công",
        description: "Đã tạo nội dung mới",
      });

      return data;
    } catch (error) {
      console.error('Error creating content item:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo nội dung",
        variant: "destructive"
      });
    }
  };

  const updateContentItem = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchContentItems();
      toast({
        title: "Thành công",
        description: "Đã cập nhật nội dung",
      });
    } catch (error) {
      console.error('Error updating content item:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật nội dung",
        variant: "destructive"
      });
    }
  };

  const deleteContentItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchContentItems();
      toast({
        title: "Thành công",
        description: "Đã xóa nội dung",
      });
    } catch (error) {
      console.error('Error deleting content item:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa nội dung",
        variant: "destructive"
      });
    }
  };

  const updateSiteSetting = async (section: string, key: string, value: any, description?: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          section,
          key,
          value,
          description: description || null
        });

      if (error) throw error;

      await fetchSiteSettings();
      toast({
        title: "Thành công",
        description: "Đã cập nhật cài đặt",
      });
    } catch (error) {
      console.error('Error updating site setting:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật cài đặt",
        variant: "destructive"
      });
    }
  };

  const updateMenu = async (id: string, updates: Partial<Menu>) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchMenus();
      toast({
        title: "Thành công",
        description: "Đã cập nhật menu",
      });
    } catch (error) {
      console.error('Error updating menu:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật menu",
        variant: "destructive"
      });
    }
  };

  return {
    contentItems,
    siteSettings,
    mediaFiles,
    menus,
    loading,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    updateSiteSetting,
    updateMenu,
    refetch: {
      contentItems: fetchContentItems,
      siteSettings: fetchSiteSettings,
      mediaFiles: fetchMediaFiles,
      menus: fetchMenus,
      all: fetchAllData
    }
  };
};