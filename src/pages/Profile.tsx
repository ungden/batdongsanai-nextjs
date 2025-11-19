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
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  User, LogOut, Save, Mail, Phone, Briefcase, DollarSign,
  Crown, Star, Upload, Camera, Settings, Heart, Eye, MessageSquare,
  Calendar, Shield, Sparkles
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
      {/* Profile Header with Avatar */}
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
              
              {/* VIP Status */}
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 p-1 bg-muted/50 rounded-2xl border border-border h-auto">
          <TabsTrigger value="info" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl font-semibold py-3">
            <User className="w-4 h-4 mr-2" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-background data-[state=active]:text-amber-600 rounded-xl font-semibold py-3">
            <Crown className="w-4 h-4 mr-2" />
            Gói VIP
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-xl font-semibold py-3">
            <Heart className="w-4 h-4 mr-2" />
            Yêu thích
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-xl font-semibold py-3">
            <Eye className="w-4 h-4 mr-2" />
            Lịch sử
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-xl font-semibold py-3">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        {/* Tab: Thông tin cá nhân */}
        <TabsContent value="info" className="space-y-6 mt-6">
          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20 rounded-t-2xl">
              <CardTitle className="text-xl font-bold text-foreground">Thông tin cá nhân</CardTitle>
              <CardDescription className="text-muted-foreground">
                Cập nhật thông tin để chúng tôi hỗ trợ bạn tốt hơn
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  className="h-12 rounded-xl border-input focus:border-primary"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="h-12 rounded-xl border-input focus:border-primary"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="h-12 rounded-xl border-input focus:border-primary"
                  placeholder="0xxx xxx xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Nghề nghiệp
                </Label>
                <Input
                  id="occupation"
                  value={profile?.occupation || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, occupation: e.target.value } : null)}
                  className="h-12 rounded-xl border-input focus:border-primary"
                  placeholder="Kỹ sư IT, Bác sĩ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetRange" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Ngân sách dự kiến
                </Label>
                <Select 
                  value={profile?.budget_range || ''} 
                  onValueChange={(value) => setProfile(prev => prev ? { ...prev, budget_range: value } : null)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-input">
                    <SelectValue placeholder="Chọn mức ngân sách" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="under-2-billion">Dưới 2 tỷ</SelectItem>
                    <SelectItem value="2-3-billion">2-3 tỷ</SelectItem>
                    <SelectItem value="3-5-billion">3-5 tỷ</SelectItem>
                    <SelectItem value="5-10-billion">5-10 tỷ</SelectItem>
                    <SelectItem value="above-10-billion">Trên 10 tỷ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full h-14 text-base font-bold rounded-xl shadow-sm transition-all"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gói VIP */}
        <TabsContent value="subscription" className="space-y-6 mt-6">
          {/* Current Subscription Status */}
          {subscription && (
            <Card className="rounded-2xl shadow-sm border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 via-orange-50/30 to-card dark:from-amber-950/30 dark:to-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                      {subscription.subscription_type === 'pro' ? (
                        <Crown className="w-8 h-8 text-white" />
                      ) : (
                        <Star className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">
                          Gói {subscription.subscription_type === 'pro' ? 'Professional' : 'Premium'}
                        </h3>
                        <VIPBadge type={subscription.subscription_type} />
                      </div>
                      {daysRemaining !== null && (
                        <p className="text-sm text-muted-foreground">
                          Còn <span className="font-bold text-amber-600 dark:text-amber-400">{daysRemaining} ngày</span> sử dụng
                        </p>
                      )}
                    </div>
                  </div>
                  {subscription.subscription_type === 'premium' && (
                    <Button 
                      onClick={() => navigate('/profile?tab=subscription')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl h-11 px-6 shadow-lg hover:opacity-90"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Nâng cấp Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* VIP Plans */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Chọn gói phù hợp với bạn</h2>
              <p className="text-muted-foreground">Nâng cấp để truy cập đầy đủ tính năng phân tích chuyên sâu</p>
            </div>
            <SubscriptionPlans />
          </div>

          {/* VIP Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Tính năng VIP</h2>
            <VIPFeatureList />
          </div>
        </TabsContent>

        {/* Tab: Yêu thích */}
        <TabsContent value="favorites" className="mt-6">
          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-red-500" />
                Dự án yêu thích
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Xem danh sách dự án yêu thích của bạn</p>
                <Button onClick={() => navigate('/favorites')} className="rounded-xl h-11">
                  Xem dự án yêu thích
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Lịch sử */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="w-5 h-5 text-primary" />
                Dự án đã xem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Eye className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Lịch sử xem dự án của bạn sẽ hiển thị ở đây</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageSquare className="w-5 h-5 text-primary" />
                Yêu cầu tư vấn
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Lịch sử yêu cầu tư vấn của bạn sẽ hiển thị ở đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cài đặt */}
        <TabsContent value="settings" className="mt-6">
          <Card className="rounded-2xl shadow-sm border border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="w-5 h-5 text-primary" />
                Cài đặt tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Thông báo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-foreground">Email thông báo</div>
                      <div className="text-sm text-muted-foreground">Nhận thông báo về dự án mới</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-input bg-background" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-foreground">Cảnh báo giá</div>
                      <div className="text-sm text-muted-foreground">Thông báo khi giá thay đổi</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-input bg-background" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Bảo mật</h3>
                <Button variant="outline" className="w-full h-12 rounded-xl border border-border justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
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
    <DesktopLayout title="Hồ sơ cá nhân" subtitle="Quản lý thông tin và gói VIP">
      {content}
    </DesktopLayout>
  );
};

export default Profile;