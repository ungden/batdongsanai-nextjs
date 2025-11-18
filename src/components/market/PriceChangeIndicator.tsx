"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceChangeIndicatorProps {
  currentPrice: number;
  launchPrice: number;
  className?: string;
  showIcon?: boolean;
  showPercentage?: boolean;
}

const PriceChangeIndicator = ({ 
  currentPrice, 
  launchPrice, 
  className,
  showIcon = true,
  showPercentage = true
}: PriceChangeIndicatorProps) => {
  const change = ((currentPrice - launchPrice) / launchPrice) * 100;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const formatChange = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-semibold text-sm",
        isPositive && "text-success",
        isNegative && "text-destructive",
        isNeutral && "text-muted-foreground",
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp className="w-4 h-4" />}
          {isNegative && <TrendingDown className="w-4 h-4" />}
          {isNeutral && <Minus className="w-4 h-4" />}
        </>
      )}
      {showPercentage && <span>{formatChange(change)}</span>}
    </div>
  );
};

export default PriceChangeIndicator;