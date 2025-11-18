"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft, Home } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        if (!fullName) {
          toast({
            title: "Lỗi",
            description: "Vui lòng nhập họ tên",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        toast({
          title: "Lỗi",
          description: result.error.message === 'Invalid login credentials' 
            ? "Email hoặc mật khẩu không đúng"
            : result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: isLogin ? "Đăng nhập thành công" : "Đăng ký thành công",
          description: isLogin ? "Chào mừng bạn trở lại!" : "Tài khoản đã được tạo thành công",
        });
        if (isLogin) {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-4">
      {/* Back to Home Button - Fixed Position */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Quay lại trang chủ</span>
        <Home className="w-4 h-4 sm:hidden" />
      </Button>

      <Card className="w-full max-w-md rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            {isLogin ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-900">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            {isLogin 
              ? 'Đăng nhập để truy cập tài khoản của bạn' 
              : 'Tạo tài khoản mới để bắt đầu'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="pl-11 h-12 rounded-xl border-2 focus:border-primary"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-2 focus:border-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-2 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? (
                'Đang xử lý...'
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                  {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-3">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
              className="text-primary hover:bg-primary/10 rounded-xl font-semibold"
            >
              {isLogin 
                ? 'Chưa có tài khoản? Đăng ký ngay' 
                : 'Đã có tài khoản? Đăng nhập'
              }
            </Button>
            
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                type="button"
                className="w-full rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Tiếp tục duyệt web không cần đăng nhập
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;