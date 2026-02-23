"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Edit, Trash2, Eye, MapPin, DollarSign, Plus } from 'lucide-react';

import { formatCurrency } from '@/utils/formatCurrency';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MyListing {
  id: string;
  title: string;
  address: string;
  price_total: number | null;
  rental_price_monthly: number | null;
  listing_type: 'sale' | 'rent';
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  is_available: boolean;
  view_count: number;
  created_at: string;
  images: { image_url: string }[];
}

export default function MyListingsTab() {
  const { user } = useAuth();
  const navigate = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_listings' as any)
        .select('*, images:listing_images(image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data as any) || []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách tin đăng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('property_listings' as any)
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_available: !currentStatus } : l));
      toast.success(`Đã ${!currentStatus ? 'hiện' : 'ẩn'} tin đăng`);
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('property_listings' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success("Đã xóa tin đăng");
    } catch (error) {
      toast.error("Không thể xóa tin đăng này");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Đã duyệt</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-500 text-white">Chờ duyệt</Badge>;
      case 'rejected': return <Badge variant="destructive">Từ chối</Badge>;
      case 'sold': return <Badge variant="outline" className="border-primary text-primary">Đã giao dịch</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý tin đăng ({listings.length})</h2>
        <Button onClick={() => navigate.push('/marketplace/create')}>
          <Plus className="w-4 h-4 mr-2" /> Đăng tin mới
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">Bạn chưa có tin đăng nào.</p>
            <Button variant="outline" onClick={() => navigate.push('/marketplace/create')}>Đăng tin ngay</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listings.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 md:h-auto bg-muted relative">
                  <img loading="lazy" decoding="async" 
                    src={item.images?.[0]?.image_url || '/placeholder.svg'} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-sm text-muted-foreground flex items-center">
                           <Eye className="w-3 h-3 mr-1" /> {item.view_count}
                         </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {item.address}
                      </div>
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <DollarSign className="w-3 h-3" />
                        {item.listing_type === 'sale' 
                          ? formatCurrency(item.price_total || 0)
                          : `${formatCurrency(item.rental_price_monthly || 0)}/tháng`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={item.is_available}
                        onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                      />
                      <span className="text-sm">{item.is_available ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate.push(`/marketplace/listing/${item.id}`)}>
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Edit className="w-3 h-3 mr-1" /> Sửa
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa tin đăng?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Tin đăng của bạn sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteListing(item.id)} className="bg-destructive text-white">
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}