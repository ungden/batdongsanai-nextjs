"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft, Home, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type AuthView = 'login' | 'register' | 'forgot_password';

const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast({
          title: "Đăng nhập thất bại",
          description: "Email hoặc mật khẩu không chính xác.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Lỗi hệ thống",
        description: "Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!fullName) {
        toast({ title: "Thiếu thông tin", description: "Vui lòng nhập họ tên", variant: "destructive" });
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, fullName);
      if (result.error) {
        toast({
          title: "Đăng ký thất bại",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email để xác thực tài khoản.",
        });
        setView('login');
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra, vui lòng thử lại", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?view=reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Đã gửi email",
        description: "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.",
      });
      setView('login');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi email đặt lại mật khẩu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <button 
                  type="button"
                  onClick={() => setView('forgot_password')}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" /> Đăng nhập
                </span>
              )}
            </Button>
          </form>
        );
      
      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Đăng ký
                </span>
              )}
            </Button>
          </form>
        );

      case 'forgot_password':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm mb-4 border border-blue-100 dark:border-blue-900">
              Nhập email của bạn, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu mới.
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-border bg-background focus:border-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : (
                <span className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" /> Gửi yêu cầu
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setView('login')}
              className="w-full hover:bg-muted"
            >
              Quay lại đăng nhập
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm hover:bg-card shadow-md rounded-xl border border-border"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trang chủ</span>
        <Home className="w-4 h-4 sm:hidden" />
      </Button>

      <Card className="w-full max-w-md rounded-2xl shadow-strong border-border bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
            {view === 'login' && <LogIn className="w-8 h-8 text-primary" />}
            {view === 'register' && <UserPlus className="w-8 h-8 text-primary" />}
            {view === 'forgot_password' && <KeyRound className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {view === 'login' && 'Đăng nhập Realprofit.vn'}
            {view === 'register' && 'Tạo tài khoản'}
            {view === 'forgot_password' && 'Khôi phục mật khẩu'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {view === 'login' && 'Chào mừng bạn quay trở lại'}
            {view === 'register' && 'Tham gia cộng đồng đầu tư bất động sản'}
            {view === 'forgot_password' && 'Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {renderForm()}
        </CardContent>

        {view !== 'forgot_password' && (
          <CardFooter className="flex flex-col gap-4 bg-muted/30 border-t border-border p-6">
            <div className="text-center text-sm text-muted-foreground">
              {view === 'login' ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              <button
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="ml-2 font-bold text-primary hover:underline focus:outline-none"
              >
                {view === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Auth;