"use client";

import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SUBSCRIPTION_PLANS, FEATURES, formatPrice, SubscriptionTier } from '@/config/subscription';
import { cn } from '@/lib/utils';

interface PricingTableProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (planId: SubscriptionTier) => void;
  className?: string;
}

const PricingTable = ({
  currentTier = 'free',
  onSelectPlan,
  className,
}: PricingTableProps) => {
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = (planId: SubscriptionTier) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="billing-toggle" className={cn(!isYearly && "font-semibold")}>
          Hàng tháng
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={cn(isYearly && "font-semibold")}>
          Hàng năm
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Tiết kiệm 17%
          </Badge>
        </Label>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = isYearly ? '/năm' : '/tháng';
          const isCurrentPlan = currentTier === plan.id;
          const isHighlighted = plan.highlighted;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-300",
                isHighlighted && "border-primary shadow-lg scale-105 z-10",
                isCurrentPlan && "ring-2 ring-primary"
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-background">
                    Gói hiện tại
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.nameVi}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {price === 0 ? (
                      'Miễn phí'
                    ) : (
                      <>
                        {formatPrice(price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          {period}
                        </span>
                      </>
                    )}
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Tương đương {formatPrice(Math.round(plan.yearlyPrice / 12))}/tháng
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={isHighlighted ? 'default' : 'outline'}
                  disabled={isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? 'Gói hiện tại' : plan.id === 'free' ? 'Bắt đầu miễn phí' : 'Nâng cấp ngay'}
                </Button>

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature comparison table - for larger screens */}
      <div className="hidden lg:block mt-12">
        <h3 className="text-xl font-semibold text-center mb-6">So sánh chi tiết tính năng</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b font-medium">Tính năng</th>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <th key={plan.id} className="text-center p-4 border-b font-medium">
                    {plan.nameVi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="p-4 border-b">
                    <div>
                      <p className="font-medium">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </td>
                  {(['free', 'premium', 'pro'] as const).map((tier) => (
                    <td key={tier} className="text-center p-4 border-b">
                      {renderFeatureValue(feature[tier])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper to render feature value
const renderFeatureValue = (value: boolean | number | string) => {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  }
  return <span className="text-sm font-medium">{value}</span>;
};

export default PricingTable;
