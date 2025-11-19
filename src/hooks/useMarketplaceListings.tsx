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
  status: string;
  created_at: string;
  images?: ListingImage[];
  is_available: boolean;
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

const MOCK_LISTINGS: PropertyListing[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    project_id: '1',
    listing_type: 'sale',
    property_type: 'Căn hộ chung cư',
    title: 'Cần bán gấp căn hộ 2PN Vinhomes Grand Park view công viên',
    description: 'Căn hộ tầng trung, view thoáng mát, đã có nội thất cơ bản. Tiện ích đầy đủ: hồ bơi, gym, công viên 36ha. Giá tốt nhất thị trường cho khách thiện chí.',
    address: 'Nguyễn Xiển, Long Thạnh Mỹ',
    district: 'Quận 9',
    city: 'TP. Hồ Chí Minh',
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 59,
    floor_number: 12,
    price_total: 2850000000,
    price_per_sqm: 48300000,
    rental_price_monthly: null,
    furniture_status: 'full',
    direction: 'Đông Nam',
    view_description: 'View công viên 36ha',
    legal_status: 'Sổ hồng',
    available_from: new Date().toISOString(),
    is_featured: true,
    is_verified: true,
    contact_name: 'Nguyễn Văn Hùng',
    contact_phone: '0909123456',
    contact_email: 'hung@example.com',
    view_count: 150,
    favorite_count: 12,
    status: 'approved',
    is_available: true,
    created_at: new Date().toISOString(),
    images: [{ id: 'img-1', image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop', is_primary: true, caption: 'Phòng khách' }]
  },
  {
    id: 'mock-2',
    user_id: 'mock-user-2',
    project_id: '1',
    listing_type: 'rent',
    property_type: 'Căn hộ chung cư',
    title: 'Cho thuê căn hộ Studio Masteri Centre Point full nội thất',
    description: 'Căn hộ mới bàn giao, nội thất cao cấp, xách vali vào ở ngay. Miễn phí quản lý 1 năm. Tiện ích hồ bơi phi thuyền, gym chuẩn quốc tế.',
    address: 'Khu đô thị Grand Park',
    district: 'Quận 9',
    city: 'TP. Hồ Chí Minh',
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 35,
    floor_number: 8,
    price_total: null,
    price_per_sqm: null,
    rental_price_monthly: 7500000,
    furniture_status: 'full',
    direction: 'Bắc',
    view_description: 'View nội khu',
    legal_status: 'Hợp đồng thuê',
    available_from: new Date().toISOString(),
    is_featured: false,
    is_verified: true,
    contact_name: 'Trần Thị Mai',
    contact_phone: '0909888777',
    contact_email: 'mai@example.com',
    view_count: 85,
    favorite_count: 5,
    status: 'approved',
    is_available: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    images: [{ id: 'img-2', image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop', is_primary: true, caption: 'Phòng ngủ' }]
  },
  {
    id: 'mock-3',
    user_id: 'mock-user-3',
    project_id: '2',
    listing_type: 'sale',
    property_type: 'Căn hộ cao cấp',
    title: 'Bán căn góc 3PN Masteri Thảo Điền, view sông Sài Gòn',
    description: 'Căn góc siêu đẹp, view trực diện sông Sài Gòn không bị chắn. Full nội thất nhập khẩu Ý. Đang có hợp đồng thuê 1500$.',
    address: 'Xa lộ Hà Nội, Thảo Điền',
    district: 'Quận 2',
    city: 'TP. Hồ Chí Minh',
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 98,
    floor_number: 25,
    price_total: 8500000000,
    price_per_sqm: 86700000,
    rental_price_monthly: null,
    furniture_status: 'full',
    direction: 'Tây Nam',
    view_description: 'View sông Sài Gòn',
    legal_status: 'Sổ hồng',
    available_from: new Date().toISOString(),
    is_featured: true,
    is_verified: true,
    contact_name: 'Lê Thanh Tâm',
    contact_phone: '0912345678',
    contact_email: 'tam.le@example.com',
    view_count: 320,
    favorite_count: 45,
    status: 'approved',
    is_available: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    images: [{ id: 'img-3', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop', is_primary: true, caption: 'Phòng khách view sông' }]
  }
];

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
        .select('*, images:listing_images(*)', { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_available', true);

      // Apply filters
      if (filters.listingType && filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.district) query = query.eq('district', filters.district);
      if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms);
      if (filters.minArea) query = query.gte('area_sqm', filters.minArea);
      if (filters.maxArea) query = query.lte('area_sqm', filters.maxArea);
      
      // Price filters
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

      if (error) {
        console.warn('Database error, using mock listings:', error.message);
        setListings(MOCK_LISTINGS);
        setTotalCount(MOCK_LISTINGS.length);
      } else {
        // Map data to ensure images array is correct
        const formattedListings = data.map((item: any) => ({
            ...item,
            images: item.images || []
        }));
        setListings(formattedListings as PropertyListing[]);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings(MOCK_LISTINGS);
      setTotalCount(MOCK_LISTINGS.length);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (listingId: string) => {
    try {
      if (listingId.startsWith('mock-')) return;
      await supabase.rpc('increment_listing_view_count' as any, { listing_uuid: listingId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (listingId.startsWith('mock-')) {
      toast.success('Đã lưu tin đăng (Demo)');
      return true;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập');
        return false;
      }

      const { data: existing } = await supabase
        .from('listing_favorites' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      if (existing) {
        await supabase.from('listing_favorites' as any).delete().eq('id', (existing as any).id);
        toast.success('Đã bỏ lưu');
        return false;
      } else {
        await supabase.from('listing_favorites' as any).insert({ user_id: user.id, listing_id: listingId });
        toast.success('Đã lưu tin đăng');
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
    if (listingId) fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      if (listingId.startsWith('mock-')) {
        const mock = MOCK_LISTINGS.find(l => l.id === listingId);
        setListing(mock || null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('property_listings' as any)
        .select('*, images:listing_images(*)')
        .eq('id', listingId)
        .single();

      if (error) throw error;

      setListing({
        ...(data as any),
        images: (data as any).images || []
      } as PropertyListing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  return { listing, loading, refreshListing: fetchListing };
};