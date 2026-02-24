"use client";

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';

import BottomNavigation from '@/components/layout/BottomNavigation';
import DesktopLayout from '@/components/layout/DesktopLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, loading, toggleFavorite } = useFavorites();
  const navigate = useRouter();
  const isMobile = useIsMobile();

  const loginPrompt = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-muted-foreground mb-4">
            Vui lòng đăng nhập để xem danh sách dự án yêu thích
          </p>
          <Button onClick={() => navigate.push('/auth')}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const content = (
    <div className="space-y-4">
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Chưa có dự án yêu thích</h2>
            <p className="text-muted-foreground mb-4">
              Hãy khám phá và lưu những dự án bạn quan tâm
            </p>
            <Button onClick={() => navigate.push('/projects')}>
              Khám phá dự án
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold truncate pr-2">{favorite.project_name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(favorite.project_id, favorite.project_name);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Đã lưu ngày {new Date(favorite.created_at).toLocaleDateString('vi-VN')}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate.push(`/projects/${favorite.project_id}`)}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (!user) {
    if (isMobile) {
      return (
        <div className="min-h-screen bg-background p-4 pb-20">
          {loginPrompt}
          <BottomNavigation />
        </div>
      );
    }
    return (
      <DesktopLayout title="Dự án yêu thích">
        {loginPrompt}
      </DesktopLayout>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border p-4 mb-4">
          <h1 className="text-xl font-bold">Dự án yêu thích</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {favorites.length} dự án đã lưu
          </p>
        </div>
        <div className="px-4">
          {content}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="Dự án yêu thích" subtitle={`${favorites.length} dự án đã lưu`}>
      {content}
    </DesktopLayout>
  );
};

export default Favorites;