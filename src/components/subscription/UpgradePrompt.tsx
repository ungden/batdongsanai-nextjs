import { useRouter } from 'next/navigation';

import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionTier, getPlanById, formatPrice } from '@/config/subscription';

import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  requiredTier: SubscriptionTier;
  feature?: string;
  variant?: 'card' | 'inline' | 'banner';
  className?: string;
}

const UpgradePrompt = ({
  requiredTier,
  feature,
  variant = 'card',
  className,
}: UpgradePromptProps) => {
  const navigate = useRouter();
  const plan = getPlanById(requiredTier);

  const handleUpgrade = () => {
    navigate.push('/profile?tab=subscription');
  };

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm",
        className
      )}>
        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-amber-800 dark:text-amber-200">
          Tính năng này yêu cầu gói <strong>{plan?.nameVi}</strong>
        </span>
        <Button
          size="sm"
          variant="link"
          className="text-amber-600 dark:text-amber-400 p-0 h-auto ml-auto"
          onClick={handleUpgrade}
        >
          Nâng cấp
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-4",
        className
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Mở khóa tính năng nâng cao</p>
              <p className="text-sm text-white/80">
                Nâng cấp lên {plan?.nameVi} để truy cập đầy đủ
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUpgrade}
            className="shrink-0"
          >
            Nâng cấp ngay
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn(
      "border-dashed border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20",
      className
    )}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
          <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-lg">Tính năng Premium</CardTitle>
        <CardDescription>
          Nâng cấp lên gói <span className="font-semibold text-amber-600 dark:text-amber-400">{plan?.nameVi}</span> để sử dụng
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {plan && (
          <div className="py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(plan.monthlyPrice)}
              <span className="text-sm font-normal text-muted-foreground">/tháng</span>
            </p>
            {plan.yearlyDiscount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Hoặc {formatPrice(plan.yearlyPrice)}/năm (tiết kiệm {plan.yearlyDiscount}%)
              </p>
            )}
          </div>
        )}

        <Button onClick={handleUpgrade} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          Nâng cấp ngay
        </Button>

        <p className="text-xs text-muted-foreground">
          Hủy bất cứ lúc nào • Thanh toán an toàn
        </p>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
