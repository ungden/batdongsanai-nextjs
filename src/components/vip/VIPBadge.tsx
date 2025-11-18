"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles } from "lucide-react";
import { SubscriptionType } from "@/hooks/usePermissions";

interface VIPBadgeProps {
  type: SubscriptionType;
  className?: string;
  showIcon?: boolean;
}

const VIPBadge = ({ type, className, showIcon = true }: VIPBadgeProps) => {
  if (type === 'free') return null;

  const config = {
    premium: {
      icon: Star,
      label: 'Premium',
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg'
    },
    pro: {
      icon: Crown,
      label: 'Pro',
      className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg'
    }
  };

  const { icon: Icon, label, className: badgeClass } = config[type];

  return (
    <Badge className={`${badgeClass} ${className} px-3 py-1 font-bold text-xs rounded-full`}>
      {showIcon && <Icon className="w-3.5 h-3.5 mr-1" />}
      {label}
    </Badge>
  );
};

export default VIPBadge;