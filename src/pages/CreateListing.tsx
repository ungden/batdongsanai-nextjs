import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Thông tin cơ bản', description: 'Loại tin và vị trí' },
  { id: 2, title: 'Chi tiết bất động sản', description: 'Diện tích, phòng ngủ, ...' },
  { id: 3, title: 'Giá & Pháp lý', description: 'Thông tin giá và giấy tờ' },
  { id: 4, title: 'Hình ảnh', description: 'Tải lên hình ảnh' },
  { id: 5, title: 'Thông tin liên hệ', description: 'Thông tin người đăng' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1
    listingType: 'sale' as 'sale' | 'rent',
    propertyType: '',
    title: '',
    description: '',
    address: '',
    district: '',
    city: 'Ho Chi Minh',

    // Step 2
    bedrooms: '',
    bathrooms: '',
    areaSqm: '',
    floorNumber: '',
    direction: '',
    viewDescription: '',

    // Step 3
    priceTotal: '',
    rentalPriceMonthly: '',
    furnitureStatus: '',
    legalStatus: '',
    availableFrom: '',

    // Step 4
    images: [] as File[],
    imagePreviews: [] as string[],

    // Step 5
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
    'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Phú Nhuận',
    'Thủ Đức', 'Bình Tân', 'Gò Vấp'
  ];

  const propertyTypes = [
    'Căn hộ chung cư',
    'Nhà riêng',
    'Nhà phố',
    'Biệt thự',
    'Đất nền',
    'Shop house',
    'Penthouse',
    'Duplex',
    'Officetel',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (formData.images.length + files.length > 10) {
      toast.error('Tối đa 10 hình ảnh');
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files],
            imagePreviews: [...prev.imagePreviews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.listingType || !formData.propertyType || !formData.title ||
            !formData.description || !formData.address || !formData.district) {
          toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
          return false;
        }
        break;
      case 2:
        if (!formData.bedrooms || !formData.bathrooms || !formData.areaSqm) {
          toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
          return false;
        }
        break;
      case 3:
        if (formData.listingType === 'sale' && !formData.priceTotal) {
          toast.error('Vui lòng nhập giá bán');
          return false;
        }
        if (formData.listingType === 'rent' && !formData.rentalPriceMonthly) {
          toast.error('Vui lòng nhập giá thuê');
          return false;
        }
        break;
      case 4:
        if (formData.images.length === 0) {
          toast.error('Vui lòng tải lên ít nhất 1 hình ảnh');
          return false;
        }
        break;
      case 5:
        if (!formData.contactName || !formData.contactPhone) {
          toast.error('Vui lòng điền đầy đủ thông tin liên hệ');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
      setSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để đăng tin');
        return;
      }

      // Calculate price per sqm
      const areaSqm = parseFloat(formData.areaSqm);
      let pricePerSqm = null;
      if (formData.listingType === 'sale' && formData.priceTotal) {
        pricePerSqm = Math.round(parseFloat(formData.priceTotal) / areaSqm);
      }

      // Insert listing
      const { data: listing, error: listingError } = await supabase
        .from('property_listings' as any)
        .insert({
          user_id: user.id,
          listing_type: formData.listingType,
          property_type: formData.propertyType,
          title: formData.title,
          description: formData.description,
          address: formData.address,
          district: formData.district,
          city: formData.city,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area_sqm: areaSqm,
          floor_number: formData.floorNumber ? parseInt(formData.floorNumber) : null,
          direction: formData.direction || null,
          view_description: formData.viewDescription || null,
          price_total: formData.priceTotal ? parseInt(formData.priceTotal) : null,
          price_per_sqm: pricePerSqm,
          rental_price_monthly: formData.rentalPriceMonthly ? parseInt(formData.rentalPriceMonthly) : null,
          furniture_status: formData.furnitureStatus || null,
          legal_status: formData.legalStatus || null,
          available_from: formData.availableFrom || null,
          contact_name: formData.contactName,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail || null,
          status: 'pending',
          is_available: true,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images
      const imageUrls: string[] = [];
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${(listing as any).id}_${i}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Insert listing images
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          listing_id: (listing as any).id,
          image_url: url,
          is_primary: index === 0,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images' as any)
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error inserting images:', imagesError);
        }
      }

      toast.success('Đăng tin thành công! Tin đăng sẽ được duyệt trong 24h.');
      navigate('/marketplace');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold mt-4">Đăng tin mới</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-sm ${
                    step.id === currentStep
                      ? 'text-primary font-semibold'
                      : step.id < currentStep
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  Bước {step.id}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step Card */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Loại tin đăng *</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={formData.listingType === 'sale' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('listingType', 'sale')}
                        className="w-full"
                      >
                        Bán
                      </Button>
                      <Button
                        type="button"
                        variant={formData.listingType === 'rent' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('listingType', 'rent')}
                        className="w-full"
                      >
                        Cho thuê
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Loại hình bất động sản *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Tiêu đề tin đăng *</Label>
                    <Input
                      id="title"
                      placeholder="VD: Bán căn hộ 2PN view sông tại Quận 2"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/200 ký tự
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả chi tiết *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      placeholder="Mô tả chi tiết về bất động sản..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Input
                      id="address"
                      placeholder="Số nhà, đường, phường/xã"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">Quận/Huyện *</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) => handleInputChange('district', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quận" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Phòng ngủ *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bathrooms">Phòng tắm *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="areaSqm">Diện tích (m²) *</Label>
                      <Input
                        id="areaSqm"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.areaSqm}
                        onChange={(e) => handleInputChange('areaSqm', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floorNumber">Tầng số</Label>
                      <Input
                        id="floorNumber"
                        type="number"
                        min="0"
                        value={formData.floorNumber}
                        onChange={(e) => handleInputChange('floorNumber', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="direction">Hướng</Label>
                      <Select
                        value={formData.direction}
                        onValueChange={(value) => handleInputChange('direction', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hướng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Đông">Đông</SelectItem>
                          <SelectItem value="Tây">Tây</SelectItem>
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Bắc">Bắc</SelectItem>
                          <SelectItem value="Đông Nam">Đông Nam</SelectItem>
                          <SelectItem value="Đông Bắc">Đông Bắc</SelectItem>
                          <SelectItem value="Tây Nam">Tây Nam</SelectItem>
                          <SelectItem value="Tây Bắc">Tây Bắc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="viewDescription">Mô tả view & cảnh quan</Label>
                    <Textarea
                      id="viewDescription"
                      rows={3}
                      placeholder="VD: View sông, view công viên, tầng cao..."
                      value={formData.viewDescription}
                      onChange={(e) => handleInputChange('viewDescription', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Price & Legal */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {formData.listingType === 'sale' ? (
                    <div>
                      <Label htmlFor="priceTotal">Giá bán (VNĐ) *</Label>
                      <Input
                        id="priceTotal"
                        type="number"
                        min="0"
                        placeholder="VD: 5000000000"
                        value={formData.priceTotal}
                        onChange={(e) => handleInputChange('priceTotal', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Nhập số tiền đầy đủ (VD: 5 tỷ = 5000000000)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="rentalPriceMonthly">Giá thuê/tháng (VNĐ) *</Label>
                      <Input
                        id="rentalPriceMonthly"
                        type="number"
                        min="0"
                        placeholder="VD: 15000000"
                        value={formData.rentalPriceMonthly}
                        onChange={(e) => handleInputChange('rentalPriceMonthly', e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="furnitureStatus">Tình trạng nội thất</Label>
                    <Select
                      value={formData.furnitureStatus}
                      onValueChange={(value) => handleInputChange('furnitureStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Đầy đủ</SelectItem>
                        <SelectItem value="partial">Cơ bản</SelectItem>
                        <SelectItem value="none">Không nội thất</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="legalStatus">Pháp lý</Label>
                    <Input
                      id="legalStatus"
                      placeholder="VD: Sổ hồng/Sổ đỏ chính chủ"
                      value={formData.legalStatus}
                      onChange={(e) => handleInputChange('legalStatus', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="availableFrom">Có sẵn từ ngày</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      value={formData.availableFrom}
                      onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Images */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>Hình ảnh (Tối đa 10 ảnh) *</Label>
                    <div className="mt-2">
                      <label htmlFor="images" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click để chọn ảnh hoặc kéo thả vào đây
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, JPEG (Tối đa 5MB/ảnh)
                          </p>
                        </div>
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {formData.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge>Ảnh chính</Badge>
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Contact */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactName">Tên người liên hệ *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Số điện thoại *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Tin đăng sẽ được kiểm duyệt trong vòng 24 giờ. Bạn sẽ nhận được thông báo qua email
                      khi tin đăng được duyệt.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Tiếp tục
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Đang đăng tin...' : 'Hoàn tất'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}