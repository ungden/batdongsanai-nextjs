"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionType = 'free' | 'premium' | 'pro';

interface Subscription {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  auto_renew: boolean;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

interface VIPPlan {
  type: SubscriptionType;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  popular?: boolean;
}

export const VIP_PLANS: VIPPlan[] = [
  {
    type: 'free',
    name: 'Miễn phí',
    price: 0,
    duration: 0,
    features: [
      'Xem thông tin cơ bản dự án',
      'Tính toán ROI đơn giản',
      'Đọc tin tức thị trường',
      'Lưu tối đa 5 dự án yêu thích'
    ]
  },
  {
    type: 'premium',
    name: 'Premium',
    price: 299000,
    duration: 30,
    popular: true,
    features: [
      'Tất cả tính năng Free',
      'Báo cáo phân tích pháp lý chi tiết',
      'Báo cáo thị trường chuyên sâu',
      'So sánh không giới hạn dự án',
      'Lưu không giới hạn yêu thích',
      'Tư vấn ưu tiên qua email',
      'Cảnh báo cơ hội đầu tư'
    ]
  },
  {
    type: 'pro',
    name: 'Professional',
    price: 799000,
    duration: 90,
    features: [
      'Tất cả tính năng Premium',
      'Báo cáo tùy chỉnh theo yêu cầu',
      'Tư vấn 1-1 với chuyên gia',
      'Truy cập API dữ liệu',
      'Phân tích danh mục đầu tư',
      'Cảnh báo real-time',
      'Hỗ trợ ưu tiên 24/7'
    ]
  }
];

// --- Caching Implementation ---
interface PermissionsCache {
  isAdmin: boolean;
  subscription: Subscription | null;
}
let permissionsCache: PermissionsCache | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// --- End Caching ---

export const usePermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    // Check cache first
    if (permissionsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      setIsAdmin(permissionsCache.isAdmin);
      setSubscription(permissionsCache.subscription);
      setLoading(false);
      return;
    }

    try {
      const [adminRoleRes, subscriptionRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single(),
        supabase.from('user_subscriptions').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).single()
      ]);

      const isAdminResult = !adminRoleRes.error && !!adminRoleRes.data;
      
      let subscriptionResult: Subscription | null = null;
      if (subscriptionRes.data) {
        subscriptionResult = {
          ...subscriptionRes.data,
          subscription_type: subscriptionRes.data.subscription_type as SubscriptionType,
          auto_renew: subscriptionRes.data.auto_renew ?? false,
          is_active: subscriptionRes.data.is_active ?? true,
          start_date: subscriptionRes.data.start_date || new Date().toISOString(),
          end_date: subscriptionRes.data.end_date || new Date().toISOString()
        };
      }

      setIsAdmin(isAdminResult);
      setSubscription(subscriptionResult);

      // Update cache
      permissionsCache = { isAdmin: isAdminResult, subscription: subscriptionResult };
      cacheTimestamp = Date.now();

    } catch (error) {
      console.error("Error fetching permissions:", error);
      setIsAdmin(false);
      setSubscription(null);
      permissionsCache = null; // Invalidate cache on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    } else {
      // Clear state and cache on logout
      setIsAdmin(false);
      setSubscription(null);
      setLoading(false);
      permissionsCache = null;
      cacheTimestamp = null;
    }
  }, [user, fetchPermissions]);

  const isVIP = (): boolean => {
    if (!subscription) return false;
    if (!subscription.is_active) return false;
    if (subscription.subscription_type === 'free') return false;
    if (subscription.end_date && new Date(subscription.end_date) < new Date()) return false;
    return true;
  };

  const isPremium = (): boolean => {
    return isVIP() && subscription?.subscription_type === 'premium';
  };

  const isPro = (): boolean => {
    return isVIP() && subscription?.subscription_type === 'pro';
  };

  const getDaysRemaining = (): number | null => {
    if (!subscription?.end_date) return null;
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const upgradeToPremium = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để nâng cấp VIP",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng thanh toán sẽ sớm được tích hợp",
    });
  };

  const upgradeToPro = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để nâng cấp VIP",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng thanh toán sẽ sớm được tích hợp",
    });
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_active: false,
          auto_renew: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchPermissions();
      toast({
        title: "Đã hủy gói VIP",
        description: "Gói VIP của bạn sẽ hết hạn vào ngày đã đăng ký",
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi hủy gói VIP",
        variant: "destructive"
      });
    }
  };

  return {
    isAdmin,
    subscription,
    loading,
    isVIP: isVIP(),
    isPremium: isPremium(),
    isPro: isPro(),
    canAccessVIPContent: isVIP(),
    daysRemaining: getDaysRemaining(),
    upgradeToPremium,
    upgradeToPro,
    cancelSubscription,
    refetch: fetchPermissions,
    plans: VIP_PLANS
  };
};