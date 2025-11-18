import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Star,
  ThumbsUp,
  CheckCircle,
  MapPin,
  Award,
  Home,
  Building2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useProjectReviews } from '@/hooks/useProjectReviews';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { WriteReviewDialog } from './WriteReviewDialog';

interface ReviewsSectionProps {
  projectId: string;
  projectName: string;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export const ReviewsSection = ({ projectId, projectName }: ReviewsSectionProps) => {
  const { reviews, stats, loading, markHelpful } = useProjectReviews(projectId);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'helpful') {
      return b.helpful_count - a.helpful_count;
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Đánh giá từ cư dân
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.totalReviews || 0} đánh giá từ người mua thực
              </p>
            </div>
            <Button onClick={() => setShowWriteReview(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Viết đánh giá
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Stats */}
          {stats && stats.totalReviews > 0 && (
            <div className="grid md:grid-cols-2 gap-6 pb-6 border-b">
              {/* Left: Rating Overview */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.totalReviews} đánh giá
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-8">{rating} ⭐</span>
                      <Progress
                        value={(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Category Ratings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Đánh giá chi tiết</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vị trí</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(stats.averageLocationRating)} />
                      <span className="text-sm font-semibold">
                        {stats.averageLocationRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Chất lượng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(stats.averageQualityRating)} />
                      <span className="text-sm font-semibold">
                        {stats.averageQualityRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Tiện ích</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(stats.averageAmenitiesRating)} />
                      <span className="text-sm font-semibold">
                        {stats.averageAmenitiesRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Chủ đầu tư</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(stats.averageDeveloperRating)} />
                      <span className="text-sm font-semibold">
                        {stats.averageDeveloperRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sort Controls */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sắp xếp:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Mới nhất
                </Button>
                <Button
                  variant={sortBy === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('helpful')}
                >
                  Hữu ích nhất
                </Button>
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rating')}
                >
                  Đánh giá cao
                </Button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h4 className="font-semibold mb-2">Chưa có đánh giá</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Hãy là người đầu tiên đánh giá dự án này
                </p>
                <Button onClick={() => setShowWriteReview(true)}>
                  Viết đánh giá đầu tiên
                </Button>
              </div>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  {/* Review Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {review.user_email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {review.user_name || review.user_email || 'Người dùng'}
                        </span>
                        {review.is_verified_buyer && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã mua
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <StarRating rating={review.rating} />
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(review.created_at), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                        {review.unit_type && (
                          <>
                            <span>•</span>
                            <span>{review.unit_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.title && (
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                  )}

                  <p className="text-sm mb-4 whitespace-pre-wrap">
                    {review.review_text}
                  </p>

                  {/* Pros & Cons */}
                  {(review.pros?.length > 0 || review.cons?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {review.pros?.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                          <h5 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            👍 Ưu điểm
                          </h5>
                          <ul className="text-sm space-y-1">
                            {review.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.cons?.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                          <h5 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                            👎 Nhược điểm
                          </h5>
                          <ul className="text-sm space-y-1">
                            {review.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.images.slice(0, 3).map((image) => (
                        <img
                          key={image.id}
                          src={image.image_url}
                          alt={image.caption || 'Review image'}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markHelpful(review.id)}
                    className="text-muted-foreground"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Hữu ích ({review.helpful_count})
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <WriteReviewDialog
        projectId={projectId}
        projectName={projectName}
        open={showWriteReview}
        onClose={() => setShowWriteReview(false)}
      />
    </>
  );
};
