"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Star, Plus, X } from 'lucide-react';

interface WriteReviewDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
}

export const WriteReviewDialog = ({
  projectId,
  projectName,
  open,
  onClose,
}: WriteReviewDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [ratings, setRatings] = useState({
    overall: 0,
    location: 0,
    quality: 0,
    amenities: 0,
    developer: 0,
  });

  const [reviewData, setReviewData] = useState({
    title: '',
    reviewText: '',
    pros: [''],
    cons: [''],
    isVerifiedBuyer: false,
    purchaseDate: '',
    unitType: '',
  });

  const handleSubmit = async () => {
    try {
      // Validation
      if (ratings.overall === 0) {
        toast.error('Vui lòng đánh giá tổng thể');
        return;
      }

      if (!reviewData.reviewText.trim()) {
        toast.error('Vui lòng viết nội dung đánh giá');
        return;
      }

      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để viết đánh giá');
        return;
      }

      // Filter out empty pros/cons
      const pros = reviewData.pros.filter(p => p.trim());
      const cons = reviewData.cons.filter(c => c.trim());

      const { error } = await supabase.from('project_reviews' as any).insert({
        project_id: projectId,
        user_id: user.id,
        rating: ratings.overall,
        location_rating: ratings.location || null,
        quality_rating: ratings.quality || null,
        amenities_rating: ratings.amenities || null,
        developer_rating: ratings.developer || null,
        title: reviewData.title.trim() || null,
        review_text: reviewData.reviewText.trim(),
        pros: pros.length > 0 ? pros : null,
        cons: cons.length > 0 ? cons : null,
        is_verified_buyer: reviewData.isVerifiedBuyer,
        purchase_date: reviewData.purchaseDate || null,
        unit_type: reviewData.unitType.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Cảm ơn đánh giá của bạn!', {
        description: 'Đánh giá sẽ được duyệt trong vòng 24h',
      });

      // Reset form
      setRatings({ overall: 0, location: 0, quality: 0, amenities: 0, developer: 0 });
      setReviewData({
        title: '',
        reviewText: '',
        pros: [''],
        cons: [''],
        isVerifiedBuyer: false,
        purchaseDate: '',
        unitType: '',
      });
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (rating: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Viết đánh giá cho {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Ratings */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Đánh giá tổng quan</h3>

              <StarRating
                label="Đánh giá tổng thể *"
                value={ratings.overall}
                onChange={(val) => setRatings({ ...ratings, overall: val })}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <StarRating
                  label="Vị trí"
                  value={ratings.location}
                  onChange={(val) => setRatings({ ...ratings, location: val })}
                />

                <StarRating
                  label="Chất lượng"
                  value={ratings.quality}
                  onChange={(val) => setRatings({ ...ratings, quality: val })}
                />

                <StarRating
                  label="Tiện ích"
                  value={ratings.amenities}
                  onChange={(val) => setRatings({ ...ratings, amenities: val })}
                />

                <StarRating
                  label="Chủ đầu tư"
                  value={ratings.developer}
                  onChange={(val) => setRatings({ ...ratings, developer: val })}
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full"
                disabled={ratings.overall === 0}
              >
                Tiếp theo
              </Button>
            </div>
          )}

          {/* Step 2: Review Content */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Nội dung đánh giá</h3>

              <div className="space-y-2">
                <Label>Tiêu đề (không bắt buộc)</Label>
                <Input
                  placeholder="VD: Căn hộ tuyệt vời, đáng đồng tiền"
                  value={reviewData.title}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Nội dung đánh giá *</Label>
                <Textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về dự án này..."
                  rows={6}
                  value={reviewData.reviewText}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, reviewText: e.target.value })
                  }
                />
              </div>

              {/* Pros */}
              <div className="space-y-2">
                <Label>Ưu điểm</Label>
                {reviewData.pros.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="VD: View đẹp, gần trường học"
                      value={pro}
                      onChange={(e) => {
                        const newPros = [...reviewData.pros];
                        newPros[index] = e.target.value;
                        setReviewData({ ...reviewData, pros: newPros });
                      }}
                    />
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newPros = reviewData.pros.filter((_, i) => i !== index);
                          setReviewData({ ...reviewData, pros: newPros });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReviewData({ ...reviewData, pros: [...reviewData.pros, ''] })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm ưu điểm
                </Button>
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <Label>Nhược điểm</Label>
                {reviewData.cons.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="VD: Giá hơi cao, xa trung tâm"
                      value={con}
                      onChange={(e) => {
                        const newCons = [...reviewData.cons];
                        newCons[index] = e.target.value;
                        setReviewData({ ...reviewData, cons: newCons });
                      }}
                    />
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newCons = reviewData.cons.filter((_, i) => i !== index);
                          setReviewData({ ...reviewData, cons: newCons });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReviewData({ ...reviewData, cons: [...reviewData.cons, ''] })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nhược điểm
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Quay lại
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  disabled={!reviewData.reviewText.trim()}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Thông tin bổ sung</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={reviewData.isVerifiedBuyer}
                  onCheckedChange={(checked) =>
                    setReviewData({
                      ...reviewData,
                      isVerifiedBuyer: checked as boolean,
                    })
                  }
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tôi là người đã mua/đang sống tại dự án này
                </label>
              </div>

              {reviewData.isVerifiedBuyer && (
                <>
                  <div className="space-y-2">
                    <Label>Ngày mua (không bắt buộc)</Label>
                    <Input
                      type="date"
                      value={reviewData.purchaseDate}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, purchaseDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Loại căn (không bắt buộc)</Label>
                    <Input
                      placeholder="VD: 2PN, 3PN, Studio"
                      value={reviewData.unitType}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, unitType: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};