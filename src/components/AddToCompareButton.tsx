"use client";

import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/stores/compareStore';
import { GitCompare, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCompareButtonProps {
  project: {
    id: string;
    name: string;
    developer: string;
    location: string;
    pricePerSqm: number;
    totalUnits: number;
    completionDate: string;
    imageUrl?: string;
    type?: string;
    area?: number;
    legalStatus?: string;
    [key: string]: any;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export const AddToCompareButton = ({
  project,
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  showText = true
}: AddToCompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompareStore();
  const inCompare = isInCompare(project.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(project.id);
      toast.success('Đã xóa khỏi so sánh');
    } else {
      if (!canAddMore()) {
        toast.error('Chỉ có thể so sánh tối đa 4 dự án', {
          description: 'Vui lòng xóa bớt dự án đã chọn'
        });
        return;
      }

      const success = addToCompare(project);
      if (success) {
        toast.success('Đã thêm vào so sánh', {
          description: 'Đi tới trang so sánh để xem chi tiết',
          action: {
            label: 'Xem ngay',
            onClick: () => window.location.href = '/compare'
          }
        });
      }
    }
  };

  return (
    <Button
      variant={inCompare ? 'default' : variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {showIcon && (
        inCompare ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <GitCompare className="h-4 w-4 mr-2" />
        )
      )}
      {showText && (inCompare ? 'Đang so sánh' : 'So sánh')}
    </Button>
  );
};
