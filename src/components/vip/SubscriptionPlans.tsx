"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles, Zap } from "lucide-react";
import { usePermissions, VIP_PLANS } from "@/hooks/usePermissions";

interface SubscriptionPlansProps {
  onSelectPlan?: (planType: string) => void;
}

const SubscriptionPlans = ({ onSelectPlan }: SubscriptionPlansProps) => {
  const { subscription, upgradeToPremium, upgradeToPro } = usePermissions();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'pro':
        return <Crown className="w-8 h-8 text-purple-600" />;
      case 'premium':
        return <Star className="w-8 h-8 text-amber-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-slate-400" />;
    }
  };

  const handleSelectPlan = (planType: string) => {
    if (onSelectPlan) {
      onSelectPlan(planType);
    } else {
      if (planType === 'premium') {
        upgradeToPremium();
      } else if (planType === 'pro') {
        upgradeToPro();
      }
    }
  };

  const isCurrentPlan = (planType: string) => {
    return subscription?.subscription_type === planType && subscription?.is_active;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {VIP_PLANS.map((plan) => {
        const isCurrent = isCurrentPlan(plan.type);
        const isUpgrade = plan.type !== 'free' && !isCurrent;

        return (
          <Card 
            key={plan.type}
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
              plan.popular 
                ? 'border-2 border-primary shadow-2xl scale-105' 
                : 'border-0 shadow-lg hover:shadow-xl'
            } ${
              isCurrent ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-white'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-lg">
                PHỔ BIẾN NHẤT
              </div>
            )}

            {isCurrent && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-br-2xl shadow-lg">
                GÓI HIỆN TẠI
              </div>
            )}

            <CardHeader className="text-center pb-6 pt-8">
              <div className="mb-4 flex justify-center">
                <div className={`p-4 rounded-2xl ${
                  plan.type === 'pro' ? 'bg-gradient-to-br from-purple-100 to-pink-100' :
                  plan.type === 'premium' ? 'bg-gradient-to-br from-amber-100 to-orange-100' :
                  'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}>
                  {getPlanIcon(plan.type)}
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </CardTitle>
              
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900">
                  {formatPrice(plan.price)}
                </div>
                {plan.duration > 0 && (
                  <div className="text-sm text-slate-600">
                    /{plan.duration} ngày
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`p-1 rounded-full ${
                        plan.type === 'pro' ? 'bg-purple-100' :
                        plan.type === 'premium' ? 'bg-amber-100' :
                        'bg-slate-100'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          plan.type === 'pro' ? 'text-purple-600' :
                          plan.type === 'premium' ? 'text-amber-600' :
                          'text-slate-600'
                        }`} />
                      </div>
                    </div>
                    <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {isUpgrade && (
                <Button 
                  onClick={() => handleSelectPlan(plan.type)}
                  className={`w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all ${
                    plan.type === 'pro' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Nâng cấp ngay
                </Button>
              )}

              {isCurrent && (
                <Button 
                  variant="outline"
                  disabled
                  className="w-full h-12 rounded-xl border-2 bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Gói hiện tại
                </Button>
              )}

              {plan.type === 'free' && !isCurrent && (
                <Button 
                  variant="outline"
                  disabled
                  className="w-full h-12 rounded-xl border-2"
                >
                  Gói miễn phí
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;