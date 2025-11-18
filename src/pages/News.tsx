import { useState } from 'react';
import { useContent } from '@/hooks/useContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Eye, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DesktopLayout from '@/components/layout/DesktopLayout';
import SEOHead from '@/components/seo/SEOHead';

export default function News() {
  const { contentItems, loading } = useContent();
  const [searchTerm, setSearchTerm] = useState('');

  const newsItems = contentItems.filter(item => 
    item.type === 'news' && 
    item.status === 'active' &&
    (searchTerm === '' || 
     item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) {
    return (
      <DesktopLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout>
      <SEOHead 
        title="Tin Tức Bất Động Sản - PropertyHub"
        description="Cập nhật tin tức mới nhất về thị trường bất động sản, xu hướng đầu tư và phân tích chuyên sâu từ các chuyên gia hàng đầu."
        keywords="tin tức bất động sản, thị trường bds, xu hướng đầu tư, PropertyHub"
      />
      
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="text-center space-y-3 p-8 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 rounded-2xl shadow-lg border border-slate-200/50">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg mb-2">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tin Tức Bất Động Sản</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về thị trường bất động sản, xu hướng đầu tư và các phân tích chuyên sâu
          </p>
        </div>

        {/* Search Bar */}
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>
              <div className="text-sm text-slate-600 font-medium px-4 py-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-full">
                {newsItems.length} bài viết
              </div>
            </div>
          </CardContent>
        </Card>

        {newsItems.length === 0 ? (
          <Card className="text-center py-16 rounded-2xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100/50">
            <CardContent>
              <Newspaper className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg">
                {searchTerm ? 'Không tìm thấy tin tức phù hợp.' : 'Chưa có tin tức nào được đăng.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Card key={item.id} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                {item.featured_image && (
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img 
                      src={item.featured_image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardContent className="flex-1 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="p-1 bg-slate-100 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <span className="font-medium">{format(new Date(item.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
                    {item.priority && item.priority > 0 && (
                      <Badge variant="secondary" className="text-xs rounded-full px-2.5 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50">
                        Nổi bật
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-tight">
                    {item.title}
                  </h3>

                  {item.content && (
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                      {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}
                  
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs rounded-full px-3 py-1 border-slate-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full h-10 rounded-xl border-2 hover:bg-slate-50 transition-all mt-auto">
                    <Eye className="h-4 w-4 mr-2" />
                    Đọc thêm
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {newsItems.length > 0 && (
          <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl">
            <p className="text-sm text-slate-600 font-medium">
              Hiển thị tất cả {newsItems.length} bài viết
            </p>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
}