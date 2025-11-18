import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropertyListing {
  id: string;
  user_id: string;
  project_id: string | null;
  listing_type: 'sale' | 'rent';
  property_type: string;
  title: string;
  description: string;
  address: string;
  district: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  floor_number: number | null;
  price_total: number | null;
  price_per_sqm: number | null;
  rental_price_monthly: number | null;
  furniture_status: string | null;
  direction: string | null;
  view_description: string | null;
  legal_status: string | null;
  available_from: string | null;
  is_featured: boolean;
  is_verified: boolean;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  view_count: number;
  favorite_count: number;
  created_at: string;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
}

export interface ListingFilters {
  listingType?: 'sale' | 'rent' | 'all';
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnitureStatus?: string;
}

export const useMarketplaceListings = (filters: ListingFilters = {}) => {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchListings();
  }, [JSON.stringify(filters)]);

  const fetchListings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('property_listings' as any)
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_available', true);

      // Apply filters
      if (filters.listingType && filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }

      if (filters.district) {
        query = query.eq('district', filters.district);
      }

      if (filters.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }

      if (filters.minArea) {
        query = query.gte('area_sqm', filters.minArea);
      }

      if (filters.maxArea) {
        query = query.lte('area_sqm', filters.maxArea);
      }

      if (filters.furnitureStatus) {
        query = query.eq('furniture_status', filters.furnitureStatus);
      }

      // Price filters (handle both sale and rent)
      if (filters.minPrice) {
        query = query.or(
          `price_total.gte.${filters.minPrice},rental_price_monthly.gte.${filters.minPrice}`
        );
      }

      if (filters.maxPrice) {
        query = query.or(
          `price_total.lte.${filters.maxPrice},rental_price_monthly.lte.${filters.maxPrice}`
        );
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch images for each listing
      const listingsWithImages = await Promise.all(
        (data || []).map(async (listing: any) => {
          const { data: images } = await supabase
            .from('listing_images' as any)
            .select('*')
            .eq('listing_id', listing.id)
            .order('is_primary', { ascending: false })
            .order('display_order', { ascending: true });

          return {
            ...listing,
            images: (images as ListingImage[]) || [],
          };
        })
      );

      setListings(listingsWithImages as PropertyListing[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (listingId: string) => {
    try {
      await supabase.rpc('increment_listing_view_count' as any, {
        listing_uuid: listingId,
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập');
        return false;
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from('listing_favorites' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('listing_favorites' as any)
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        toast.success('Đã bỏ lưu');
        return false;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('listing_favorites' as any)
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) throw error;
        toast.success('Đã lưu tin đăng');
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Có lỗi xảy ra');
      return false;
    }
  };

  return {
    listings,
    loading,
    totalCount,
    incrementViewCount,
    toggleFavorite,
    refreshListings: fetchListings,
  };
};

export const useListing = (listingId: string) => {
  const [listing, setListing] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('property_listings' as any)
        .select('*')
        .eq('id', listingId)
        .single();

      if (error) throw error;

      // Fetch images
      const { data: images } = await supabase
        .from('listing_images' as any)
        .select('*')
        .eq('listing_id', listingId)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true });

      setListing({
        ...(data as PropertyListing),
        images: (images as ListingImage[]) || [],
      });

      // Increment view count
      await supabase.rpc('increment_listing_view_count' as any, {
        listing_uuid: listingId,
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Không thể tải tin đăng');
    } finally {
      setLoading(false);
    }
  };

  return {
    listing,
    loading,
    refreshListing: fetchListing,
  };
};