import { useState } from 'react';
import { Bell, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatCurrency';

interface PriceAlertDialogProps {
  projectId: string;
  projectName: string;
  currentPrice?: number;
}

export const PriceAlertDialog = ({
  projectId,
  projectName,
  currentPrice = 0
}: PriceAlertDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState<'price_drop' | 'price_rise' | 'percentage_change'>('price_drop');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tạo cảnh báo');
      return;
    }

    if (alertType !== 'percentage_change' && !targetPrice) {
      toast.error('Vui lòng nhập giá mục tiêu');
      return;
    }

    if (alertType === 'percentage_change' && !percentage) {
      toast.error('Vui lòng nhập phần trăm thay đổi');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          project_id: projectId,
          project_name: projectName,
          alert_type: alertType,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          percentage_threshold: percentage ? parseFloat(percentage) : null,
          current_price: currentPrice,
          is_active: true
        });

      if (error) throw error;

      toast.success('Đã tạo cảnh báo giá');
      setOpen(false);
      setTargetPrice('');
      setPercentage('');
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Không thể tạo cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Tạo cảnh báo giá
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo cảnh báo giá</DialogTitle>
          <DialogDescription>
            Nhận thông báo khi giá {projectName} thay đổi theo điều kiện bạn đặt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentPrice > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Giá hiện tại</p>
              <p className="text-lg font-semibold">{formatCurrency(currentPrice)}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label>Loại cảnh báo</Label>
            <RadioGroup value={alertType} onValueChange={(value: any) => setAlertType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_drop" id="price_drop" />
                <Label htmlFor="price_drop" className="flex items-center cursor-pointer">
                  <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                  Giá giảm xuống
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_rise" id="price_rise" />
                <Label htmlFor="price_rise" className="flex items-center cursor-pointer">
                  <TrendingUp className="h-4 w-4 mr-2 text-success" />
                  Giá tăng lên
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage_change" id="percentage_change" />
                <Label htmlFor="percentage_change" className="flex items-center cursor-pointer">
                  <Percent className="h-4 w-4 mr-2" />
                  Thay đổi theo phần trăm
                </Label>
              </div>
            </RadioGroup>
          </div>

          {alertType !== 'percentage_change' ? (
            <div className="space-y-2">
              <Label htmlFor="targetPrice">
                {alertType === 'price_drop' ? 'Giá mục tiêu (thấp hơn)' : 'Giá mục tiêu (cao hơn)'}
              </Label>
              <Input
                id="targetPrice"
                type="number"
                placeholder="Nhập giá mục tiêu"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="percentage">Phần trăm thay đổi (%)</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="VD: 10 (tăng/giảm 10%)"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min="1"
                max="100"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleCreateAlert} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo cảnh báo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
