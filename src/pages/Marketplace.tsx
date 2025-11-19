import { useState } from 'react';
import { useMarketplaceListings, ListingFilters } from '@/hooks/useMarketplaceListings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MapPin, Bed, Bath, Maximize, Eye, Filter, X, Star, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Marketplace() {
  const [filters, setFilters] = useState<ListingFilters>({
    listingType: 'all',
  });
  const [showFilters, setShowFilters] = useState(false); // Default hidden for cleaner look
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'area'>('newest');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
    setFilters({ listingType: filters.listingType }); // Keep current type
  };

  const content = (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {!isMobile && <h1 className="text-3xl font-bold text-foreground">Chợ Bất Động Sản</h1>}
          <p className="text-muted-foreground mt-1 text-sm">
            Tìm thấy {totalCount} tin đăng phù hợp
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/marketplace/create')} className="md:w-auto w-full shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Đăng tin mới
        </Button>
      </div>

      {/* Toolbar: Tabs & Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-2 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 border-dashed"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
            {(filters.district || filters.minPrice || filters.maxPrice) && (
               <Badge variant="default" className="ml-2 h-5 px-1.5 text-[10px]">!</Badge>
            )}
          </Button>

          <Tabs
            value={filters.listingType || 'all'}
            onValueChange={(value) => handleFilterChange('listingType', value)}
            className="w-auto"
          >
            <TabsList className="h-9 bg-muted/50">
              <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
              <TabsTrigger value="sale" className="text-xs">Mua bán</TabsTrigger>
              <TabsTrigger value="rent" className="text-xs">Cho thuê</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs font-medium whitespace-nowrap text-muted-foreground">Sắp xếp:</Label>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs bg-background border-input">
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
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Collapsible Filters Sidebar */}
        {showFilters && (
          <div className="w-full lg:w-64 shrink-0 animate-in slide-in-from-left-5 duration-300">
            <Card className="bg-card border-border shadow-sm sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-medium">Bộ lọc tìm kiếm</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* District Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quận/Huyện</Label>
                  <Select
                    value={filters.district || 'all'}
                    onValueChange={(value) => handleFilterChange('district', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Giá {filters.listingType === 'rent' ? '(tr/tháng)' : '(tỷ)'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      className="h-9 text-sm"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Đến"
                      className="h-9 text-sm"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Số phòng ngủ</Label>
                  <Select
                    value={filters.bedrooms?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('bedrooms', value === 'all' ? undefined : Number(value))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="1">1 phòng</SelectItem>
                      <SelectItem value="2">2 phòng</SelectItem>
                      <SelectItem value="3">3 phòng</SelectItem>
                      <SelectItem value="4">4+ phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Area Range */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Diện tích (m²)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      className="h-9 text-sm"
                      value={filters.minArea || ''}
                      onChange={(e) => handleFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Đến"
                      className="h-9 text-sm"
                      value={filters.maxArea || ''}
                      onChange={(e) => handleFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="w-full h-8 text-xs border-dashed"
                >
                  Xóa tất cả lọc
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Listings Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-card border-border">
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
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-card border border-dashed border-border rounded-xl text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-3">
                <Filter className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Không tìm thấy kết quả</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Button variant="outline" onClick={resetFilters} size="sm">
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
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
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          {content}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="Chợ Bất Động Sản">
      {content}
    </DesktopLayout>
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
    <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden bg-card border-border h-full flex flex-col">
      <Link to={`/marketplace/listing/${listing.id}`} className="relative aspect-[4/3] overflow-hidden bg-muted block">
        <img
          src={primaryImage}
          alt={listing.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <Badge variant={listing.listing_type === 'sale' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 shadow-sm">
            {listing.listing_type === 'sale' ? 'Bán' : 'Thuê'}
          </Badge>
          {listing.is_featured && (
            <Badge className="bg-yellow-500 text-white border-0 shadow-sm text-[10px] h-5 px-1.5">
              <Star className="w-2.5 h-2.5 mr-1" /> Hot
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white backdrop-blur-[2px] rounded-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        
        {/* Price Tag Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-baseline gap-1.5">
             <span className="text-lg font-bold text-white text-shadow-sm">{priceLabel}</span>
             {listing.price_per_sqm && (
               <span className="text-[10px] text-white/80">
                 {formatCurrency(listing.price_per_sqm / 1000000)}tr/m²
               </span>
             )}
          </div>
        </div>
      </Link>

      <CardContent className="p-3 flex flex-col flex-1">
        <Link to={`/marketplace/listing/${listing.id}`} className="block flex-1">
          <h4 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors min-h-[40px] leading-snug">
            {listing.title}
          </h4>

          <div className="flex items-center text-xs text-muted-foreground mt-2 mb-3">
            <MapPin className="w-3 h-3 mr-1 shrink-0" />
            <span className="truncate">{listing.district}, {listing.city}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
             <div className="flex items-center gap-3 text-xs text-foreground/80">
               <div className="flex items-center gap-1">
                 <Bed className="w-3.5 h-3.5 text-muted-foreground" /> {listing.bedrooms}
               </div>
               <div className="flex items-center gap-1">
                 <Bath className="w-3.5 h-3.5 text-muted-foreground" /> {listing.bathrooms}
               </div>
               <div className="flex items-center gap-1">
                 <Maximize className="w-3.5 h-3.5 text-muted-foreground" /> {listing.area_sqm}m²
               </div>
             </div>
             
             <div className="text-[10px] text-muted-foreground">
                {new Date(listing.created_at).toLocaleDateString('vi-VN')}
             </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}