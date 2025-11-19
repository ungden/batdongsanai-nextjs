"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNavigation from '@/components/layout/BottomNavigation';
import DesktopLayout from '@/components/layout/DesktopLayout';
import SubscriptionPlans from '@/components/vip/SubscriptionPlans';
import VIPBadge from '@/components/vip/VIPBadge';
import VIPFeatureList from '@/components/vip/VIPFeatureList';
import MyListingsTab from '@/components/profile/MyListingsTab';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  User, LogOut, Save, Mail, Phone, Briefcase, DollarSign,
  Crown, Star, Upload, Camera, Settings, Heart, Eye, MessageSquare,
  Calendar, Shield, Sparkles, Store
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  occupation: string;
  budget_range: string;
  avatar_url: string | null;
  subscription_type: 'free' | 'premium' | 'pro';
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { subscription, isVIP, daysRemaining, loading: permissionsLoading } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'info';
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || user.email || '',
          occupation: data.occupation || '',
          budget_range: data.budget_range || '',
          avatar_url: data.avatar_url,
          subscription_type: (data.subscription_type as 'free' | 'premium' | 'pro') || 'free'
        });
      } else {
        setProfile({
          id: '',
          full_name: user.user_metadata?.full_name || '',
          phone: '',
          email: user.email || '',
          occupation: '',
          budget_range: '',
          avatar_url: null,
          subscription_type: 'free'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          occupation: profile.occupation,
          budget_range: profile.budget_range,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ đã được lưu",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu thông tin",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Thành công",
        description: "Đã tải lên avatar mới",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải lên avatar",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-border bg-card">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Yêu cầu đăng nhập</h2>
            <p className="text-muted-foreground mb-6">
              Vui lòng đăng nhập để xem và quản lý hồ sơ
            </p>
            <Button onClick={() => navigate('/auth')} className="rounded-xl h-12 px-8 shadow-lg">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="rounded-2xl shadow-md border-border bg-gradient-to-br from-card to-muted/30 overflow-hidden">
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-8 h-8 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
              
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {profile?.full_name || 'Người dùng'}
                </h1>
                {subscription && (
                  <VIPBadge type={subscription.subscription_type} />
                )}
              </div>
              <p className="text-muted-foreground mb-4">{profile?.email}</p>
              
              {isVIP && daysRemaining !== null && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Còn {daysRemaining} ngày VIP
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl border-border hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all h-11"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto p-1 bg-muted/50 rounded-2xl border border-border h-auto space-x-1">
          <TabsTrigger value="info" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl font-semibold py-3 transition-all">
            <User className="w-4 h-4 mr-2" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl font-semibold py-3 transition-all">
            <Store className="w-4 h-4 mr-2" />
            Tin đăng
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 rounded-xl font-semibold py-3 transition-all">
            <Crown className="w-4 h-4 mr-2" />
            Gói VIP
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 min-w-[100px] data-[state=active]:bg-background data-[state=active]:text-primary rounded-xl font-semibold py-3 transition-all">
            <Heart className="w-4 h-4 mr-2" />
            Yêu thích
          </TabsTrigger>
        </TabsList>

        {/* Content - Thông tin cá nhân */}
        <TabsContent value="info" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2">
          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin để chúng tôi hỗ trợ bạn tốt hơn</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  className="h-12 rounded-xl bg-background border-input focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="h-12 rounded-xl bg-background border-input focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Nghề nghiệp</Label>
                <Input
                  id="occupation"
                  value={profile?.occupation || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, occupation: e.target.value } : null)}
                  className="h-12 rounded-xl bg-background border-input focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Ngân sách dự kiến</Label>
                <Select 
                  value={profile?.budget_range || ''} 
                  onValueChange={(value) => setProfile(prev => prev ? { ...prev, budget_range: value } : null)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-background border-input">
                    <SelectValue placeholder="Chọn mức ngân sách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-2-billion">Dưới 2 tỷ</SelectItem>
                    <SelectItem value="2-3-billion">2-3 tỷ</SelectItem>
                    <SelectItem value="3-5-billion">3-5 tỷ</SelectItem>
                    <SelectItem value="5-10-billion">5-10 tỷ</SelectItem>
                    <SelectItem value="above-10-billion">Trên 10 tỷ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full h-14 text-base font-bold rounded-xl shadow-md">
                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content - Quản lý tin đăng */}
        <TabsContent value="listings" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2">
          <MyListingsTab />
        </TabsContent>

        {/* Content - Gói VIP */}
        <TabsContent value="subscription" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Gói thành viên</h2>
            <SubscriptionPlans />
            <VIPFeatureList />
          </div>
        </TabsContent>

        {/* Content - Yêu thích */}
        <TabsContent value="favorites" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2">
           <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
             <div className="p-4 bg-muted rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
               <Heart className="w-10 h-10 text-muted-foreground/70" />
             </div>
             <h3 className="text-xl font-semibold mb-2">Dự án yêu thích</h3>
             <p className="text-muted-foreground mb-6">Xem và quản lý danh sách các dự án bạn đã lưu</p>
             <Button onClick={() => navigate('/favorites')} className="rounded-xl px-8">Xem ngay</Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          {content}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="Hồ sơ cá nhân" subtitle="Quản lý thông tin và tài sản">
      {content}
    </DesktopLayout>
  );
};

export default Profile;