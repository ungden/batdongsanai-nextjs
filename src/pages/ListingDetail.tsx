import { useParams, useNavigate } from 'react-router-dom';
import { useListing } from '@/hooks/useMarketplaceListings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  MapPin, Bed, Bath, Maximize, Eye, Heart, Share2, Phone, Mail,
  Calendar, Home, Compass, Building2, FileText, Sofa, ArrowLeft, Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listing, loading } = useListing(id!);
  const [selectedImage, setSelectedImage] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy tin đăng</p>
            <Button onClick={() => navigate('/marketplace')} className="mt-4">
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryImage = listing.images?.find(img => img.is_primary)?.image_url
    || listing.images?.[0]?.image_url
    || '/placeholder.svg';

  const price = listing.listing_type === 'sale'
    ? listing.price_total
    : listing.rental_price_monthly;

  const priceLabel = listing.listing_type === 'sale'
    ? formatCurrency(price)
    : `${formatCurrency(price)}/tháng`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-6">
          <div className="aspect-video rounded-lg overflow-hidden mb-4">
            <img
              src={listing.images?.[selectedImage]?.image_url || primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video rounded overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
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
                    <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.address}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Price & Key Info */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giá</p>
                    <p className="text-2xl font-bold text-primary">{priceLabel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giá/m²</p>
                    <p className="text-lg font-semibold">
                      {listing.price_per_sqm ? formatCurrency(listing.price_per_sqm) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Diện tích</p>
                    <p className="text-lg font-semibold">{listing.area_sqm}m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lượt xem</p>
                    <p className="text-lg font-semibold flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {listing.view_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <DetailRow icon={Home} label="Loại hình" value={listing.property_type} />
                  <DetailRow icon={Bed} label="Phòng ngủ" value={`${listing.bedrooms} phòng`} />
                  <DetailRow icon={Bath} label="Phòng tắm" value={`${listing.bathrooms} phòng`} />
                  <DetailRow icon={Maximize} label="Diện tích" value={`${listing.area_sqm}m²`} />
                  {listing.floor_number && (
                    <DetailRow icon={Building2} label="Tầng" value={`Tầng ${listing.floor_number}`} />
                  )}
                  {listing.direction && (
                    <DetailRow icon={Compass} label="Hướng" value={listing.direction} />
                  )}
                  {listing.furniture_status && (
                    <DetailRow
                      icon={Sofa}
                      label="Nội thất"
                      value={
                        listing.furniture_status === 'full' ? 'Đầy đủ' :
                        listing.furniture_status === 'partial' ? 'Cơ bản' : 'Không nội thất'
                      }
                    />
                  )}
                  {listing.legal_status && (
                    <DetailRow icon={FileText} label="Pháp lý" value={listing.legal_status} />
                  )}
                  {listing.available_from && (
                    <DetailRow
                      icon={Calendar}
                      label="Có sẵn từ"
                      value={new Date(listing.available_from).toLocaleDateString('vi-VN')}
                    />
                  )}
                </div>

                {listing.view_description && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-semibold mb-2">View & Cảnh quan</h4>
                      <p className="text-muted-foreground">{listing.view_description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Người đăng</p>
                  <p className="font-semibold">{listing.contact_name}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <a href={`tel:${listing.contact_phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {listing.contact_phone}
                    </a>
                  </Button>

                  {listing.contact_email && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${listing.contact_email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}

                  <ContactDialog
                    open={contactDialogOpen}
                    onOpenChange={setContactDialogOpen}
                    listingId={listing.id}
                    listingTitle={listing.title}
                  />
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Đăng ngày: {new Date(listing.created_at).toLocaleDateString('vi-VN')}</p>
                  <p className="mt-1">ID: {listing.id.slice(0, 8)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: any;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-center">
      <Icon className="w-5 h-5 mr-2 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

function ContactDialog({ open, onOpenChange, listingId, listingTitle }: ContactDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('listing_contacts').insert({
        listing_id: listingId,
        user_id: user?.id || null,
        contact_name: formData.name,
        contact_phone: formData.phone,
        contact_email: formData.email,
        message: formData.message,
        status: 'new',
      });

      if (error) throw error;

      toast.success('Đã gửi yêu cầu liên hệ thành công!');
      onOpenChange(false);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending contact request:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Gửi tin nhắn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liên hệ người bán</DialogTitle>
          <DialogDescription>
            Gửi tin nhắn cho người đăng về: {listingTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Họ tên *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="message">Tin nhắn *</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tôi quan tâm đến tin đăng này..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
