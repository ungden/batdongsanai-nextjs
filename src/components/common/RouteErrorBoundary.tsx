import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, FileQuestion, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Đã xảy ra lỗi';
  let description = 'Xin lỗi, đã có lỗi xảy ra khi tải trang này.';
  let Icon = AlertTriangle;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Không tìm thấy trang';
      description = 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.';
      Icon = FileQuestion;
    } else if (error.status === 401) {
      title = 'Không có quyền truy cập';
      description = 'Bạn cần đăng nhập để xem trang này.';
    } else if (error.status === 403) {
      title = 'Truy cập bị từ chối';
      description = 'Bạn không có quyền truy cập trang này.';
    } else if (error.status === 500) {
      title = 'Lỗi máy chủ';
      description = 'Đã xảy ra lỗi từ phía máy chủ. Vui lòng thử lại sau.';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
