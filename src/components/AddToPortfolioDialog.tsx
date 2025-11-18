import { useState } from 'react';
import { Briefcase } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AddToPortfolioDialogProps {
  projectId: string;
  projectName: string;
  currentPrice?: number;
  triggerButton?: React.ReactNode;
}

export const AddToPortfolioDialog = ({
  projectId,
  projectName,
  currentPrice = 0,
  triggerButton
}: AddToPortfolioDialogProps) => {
  const { user } = useAuth();
  const { addToPortfolio } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    purchase_price: currentPrice || '',
    purchase_date: new Date().toISOString().split('T')[0],
    quantity: 1,
    notes: ''
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh mục');
      return;
    }

    if (!formData.purchase_price || !formData.purchase_date) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);

    try {
      await addToPortfolio({
        project_id: projectId,
        project_name: projectName,
        purchase_price: typeof formData.purchase_price === 'string'
          ? parseFloat(formData.purchase_price)
          : formData.purchase_price,
        purchase_date: formData.purchase_date,
        quantity: formData.quantity,
        notes: formData.notes || undefined,
        current_value: currentPrice || undefined
      });

      setOpen(false);
      setFormData({
        purchase_price: currentPrice || '',
        purchase_date: new Date().toISOString().split('T')[0],
        quantity: 1,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Thêm vào danh mục
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm vào danh mục đầu tư</DialogTitle>
          <DialogDescription>
            Theo dõi khoản đầu tư của bạn vào {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Giá mua (VNĐ)</Label>
            <Input
              id="purchase_price"
              type="number"
              placeholder="Nhập giá mua"
              value={formData.purchase_price}
              onChange={(e) =>
                setFormData({ ...formData, purchase_price: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Ngày mua</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Thêm ghi chú về khoản đầu tư này..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang thêm...' : 'Thêm vào danh mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
