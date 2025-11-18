"use client";

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VIPGateProps {
  children: ReactNode;
  requiredLevel?: 'premium' | 'pro';
  fallback?: ReactNode;
  showPreview?: boolean;
}

const VIPGate = ({ 
  children, 
  requiredLevel = 'premium',
  fallback,
  showPreview = true 
}: VIPGateProps) => {
  const { isVIP, isPro } = usePermissions();
  const navigate = useNavigate();

  // Check access
  const hasAccess = requiredLevel === 'premium' ? isVIP : isPro;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default VIP gate UI
  return (
    <div className="relative">
      {/* Blurred preview */}
      {showPreview && (
        <div className="pointer-events-none select-none">
          <div className="blur-sm opacity-40">
            {children}
          </div>
        </div>
      )}

      {/* Upgrade prompt overlay */}
      <Card className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl">
        <CardContent className="text-center p-8 max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-3xl rounded-full" />
            <div className="relative p-4 bg-gradient-to-br from-amber-500 to-purple-600 rounded-3xl shadow-2xl inline-block">
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Nội dung VIP {requiredLevel === 'pro' ? 'Pro' : 'Premium'}
          </h3>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Nâng cấp lên gói <span className="font-bold text-primary">
              {requiredLevel === 'pro' ? 'Professional' : 'Premium'}
            </span> để truy cập báo cáo phân tích chuyên sâu và nhiều tính năng độc quyền khác.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/profile?tab=subscription')}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-amber-500 to-purple-600 text-white"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Nâng cấp ngay
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/profile?tab=subscription')}
              className="w-full h-12 rounded-xl border-2 hover:bg-slate-50"
            >
              Xem các gói VIP
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Lock className="w-4 h-4" />
              <span>Nội dung được bảo vệ bởi VIP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VIPGate;