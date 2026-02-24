"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectReview {
  id: string;
  project_id: string;
  user_id: string;
  rating: number;
  location_rating: number;
  quality_rating: number;
  amenities_rating: number;
  developer_rating: number;
  title: string;
  review_text: string;
  pros: string[];
  cons: string[];
  is_verified_buyer: boolean;
  purchase_date: string;
  unit_type: string;
  helpful_count: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
  images?: ReviewImage[];
}

export interface ReviewImage {
  id: string;
  image_url: string;
  caption: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageLocationRating: number;
  averageQualityRating: number;
  averageAmenitiesRating: number;
  averageDeveloperRating: number;
}

export const useProjectReviews = (projectId: string) => {
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchReviews();
    }
  }, [projectId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('project_reviews' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch images for each review
      const reviewsWithImages = await Promise.all(
        (reviewsData || []).map(async (review: any) => {
          const { data: images } = await supabase
            .from('review_images' as any)
            .select('*')
            .eq('review_id', review.id);

          return {
            ...review,
            images: ((images as any) as ReviewImage[]) || [],
          };
        })
      );

      setReviews(reviewsWithImages as ProjectReview[]);

      // Calculate stats
      if (reviewsData && reviewsData.length > 0) {
        const totalReviews = reviewsData.length;
        const sumRating = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0);
        const sumLocation = reviewsData.reduce((sum: number, r: any) => sum + (r.location_rating || 0), 0);
        const sumQuality = reviewsData.reduce((sum: number, r: any) => sum + (r.quality_rating || 0), 0);
        const sumAmenities = reviewsData.reduce((sum: number, r: any) => sum + (r.amenities_rating || 0), 0);
        const sumDeveloper = reviewsData.reduce((sum: number, r: any) => sum + (r.developer_rating || 0), 0);

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((r: any) => {
          distribution[r.rating as keyof typeof distribution]++;
        });

        setStats({
          averageRating: sumRating / totalReviews,
          totalReviews,
          ratingDistribution: distribution,
          averageLocationRating: sumLocation / totalReviews,
          averageQualityRating: sumQuality / totalReviews,
          averageAmenitiesRating: sumAmenities / totalReviews,
          averageDeveloperRating: sumDeveloper / totalReviews,
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          averageLocationRating: 0,
          averageQualityRating: 0,
          averageAmenitiesRating: 0,
          averageDeveloperRating: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để đánh giá');
        return;
      }

      const { error } = await supabase
        .from('review_helpful_votes' as any)
        .insert({ review_id: reviewId, user_id: user.id });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.info('Bạn đã đánh giá review này rồi');
        } else {
          throw error;
        }
      } else {
        toast.success('Cảm ơn đánh giá của bạn!');
        fetchReviews(); // Refresh to update count
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  return {
    reviews,
    stats,
    loading,
    markHelpful,
    refreshReviews: fetchReviews,
  };
};