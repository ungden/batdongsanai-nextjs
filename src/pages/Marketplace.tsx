import { useState } from 'react';
import { useMarketplaceListings, ListingFilters } from '@/hooks/useMarketplaceListings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MapPin, Bed, Bath, Maximize, Eye, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Marketplace() {
  const [filters, setFilters] = useState<ListingFilters>({
    listingType: 'all',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'area'>('newest');

  const { listings, loading, totalCount, toggleFavorite } = useMarketplaceListings(filters);

  // Sort listings
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price_asc':
        const priceA = a.listing_type === 'sale' ? (a.price_total || 0) : (a.rental_price_monthly || 0);
        const priceB = b.listing_type === 'sale' ? (b.price_total || 0) : (b.rental_price_monthly || 0);
        return priceA - priceB;
      case 'price_desc':
        const priceA2 = a.listing_type === 'sale' ? (a.price_total || 0) : (a.rental_price_monthly || 0);
        const priceB2 = b.listing_type === 'sale' ? (b.price_total || 0) : (b.rental_price_monthly || 0);
        return priceB2 - priceA2;
      case 'area':
        return b.area_sqm - a.area_sqm;
      default:
        return 0;
    }
  });

  const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
    'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Phú Nhuận',
    'Thủ Đức', 'Bình Tân', 'Gò Vấp'
  ];

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ listingType: 'all' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Chợ Bất Động Sản</h1>
              <p className="text-muted-foreground mt-1">
                {totalCount} tin đăng đang có sẵn
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/marketplace/create">Đăng tin</Link>
            </Button>
          </div>

          {/* Listing Type Tabs */}
          <Tabs
            value={filters.listingType || 'all'}
            onValueChange={(value) => handleFilterChange('listingType', value)}
          >
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="sale">Mua bán</TabsTrigger>
              <TabsTrigger value="rent">Cho thuê</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={cn(
            "w-80 shrink-0 space-y-4 transition-all",
            !showFilters && "hidden"
          )}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Bộ lọc</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Xóa lọc
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* District Filter */}
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Select
                    value={filters.district || ''}
                    onValueChange={(value) => handleFilterChange('district', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>
                    Giá {filters.listingType === 'rent' ? '(triệu/tháng)' : '(tỷ)'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label>Số phòng ngủ</Label>
                  <Select
                    value={filters.bedrooms?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('bedrooms', value ? Number(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn số phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="1">1 phòng</SelectItem>
                      <SelectItem value="2">2 phòng</SelectItem>
                      <SelectItem value="3">3 phòng</SelectItem>
                      <SelectItem value="4">4+ phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Area Range */}
                <div className="space-y-2">
                  <Label>Diện tích (m²)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      value={filters.minArea || ''}
                      onChange={(e) => handleFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxArea || ''}
                      onChange={(e) => handleFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Furniture Status */}
                <div className="space-y-2">
                  <Label>Nội thất</Label>
                  <Select
                    value={filters.furnitureStatus || ''}
                    onValueChange={(value) => handleFilterChange('furnitureStatus', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tình trạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="full">Đầy đủ</SelectItem>
                      <SelectItem value="partial">Cơ bản</SelectItem>
                      <SelectItem value="none">Không nội thất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
                  <SelectItem value="area">Diện tích lớn nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Không tìm thấy tin đăng nào</p>
                  <Button variant="link" onClick={resetFilters} className="mt-2">
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onToggleFavorite={() => toggleFavorite(listing.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ListingCardProps {
  listing: any;
  onToggleFavorite: () => void;
}

function ListingCard({ listing, onToggleFavorite }: ListingCardProps) {
  const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url
    || listing.images?.[0]?.image_url
    || '/placeholder.svg';

  const price = listing.listing_type === 'sale'
    ? listing.price_total
    : listing.rental_price_monthly;

  const priceLabel = listing.listing_type === 'sale'
    ? formatCurrency(price)
    : `${formatCurrency(price)}/tháng`;

  return (
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
      <Link to={`/marketplace/listing/${listing.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={primaryImage}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant={listing.listing_type === 'sale' ? 'default' : 'secondary'}>
              {listing.listing_type === 'sale' ? 'Bán' : 'Thuê'}
            </Badge>
            {listing.is_featured && (
              <Badge className="bg-yellow-500">
                <Star className="w-3 h-3 mr-1" /> Nổi bật
              </Badge>
            )}
            {listing.is_verified && (
              <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700">
                ✓ Đã xác minh
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/marketplace/listing/${listing.id}`}>
          <div className="space-y-2">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-primary">{priceLabel}</h3>
              {listing.price_per_sqm && (
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(listing.price_per_sqm)}/m²
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h4>

            {/* Location */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1 shrink-0" />
              <span className="line-clamp-1">{listing.district}, {listing.city}</span>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {listing.bedrooms} PN
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {listing.bathrooms} WC
              </div>
              <div className="flex items-center">
                <Maximize className="w-4 h-4 mr-1" />
                {listing.area_sqm}m²
              </div>
            </div>

            {/* View count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {listing.view_count} lượt xem
              </div>
              <span>
                {new Date(listing.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
