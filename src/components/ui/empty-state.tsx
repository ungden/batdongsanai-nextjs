import { ReactNode } from "react";
import {
  Search,
  Heart,
  FileText,
  AlertCircle,
  Inbox,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) => {
  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
        {icon && (
          <div className="p-4 bg-muted rounded-full">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

// Predefined empty states for common scenarios
export const NoSearchResults = ({ onReset }: { onReset?: () => void }) => (
  <EmptyState
    icon={<Search className="h-12 w-12 text-muted-foreground" />}
    title="Không tìm thấy kết quả"
    description="Không có dự án nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc từ khóa."
    action={onReset ? { label: "Xóa bộ lọc", onClick: onReset } : undefined}
  />
);

export const NoFavorites = ({ onExplore }: { onExplore?: () => void }) => (
  <EmptyState
    icon={<Heart className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có dự án yêu thích"
    description="Bạn chưa lưu dự án nào. Khám phá các dự án và thêm vào danh sách yêu thích để theo dõi dễ dàng hơn."
    action={onExplore ? { label: "Khám phá dự án", onClick: onExplore } : undefined}
  />
);

export const NoProjects = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có dự án"
    description="Hiện chưa có dự án nào trong hệ thống. Hãy thêm dự án mới để bắt đầu."
    action={onCreate ? { label: "Thêm dự án mới", onClick: onCreate } : undefined}
  />
);

export const NoReports = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<FileText className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có báo cáo"
    description="Chưa có báo cáo phân tích nào được tạo. Tạo báo cáo mới để bắt đầu phân tích dự án."
    action={onCreate ? { label: "Tạo báo cáo mới", onClick: onCreate } : undefined}
  />
);

export const NoNotifications = () => (
  <EmptyState
    icon={<Bell className="h-12 w-12 text-muted-foreground" />}
    title="Không có thông báo"
    description="Bạn đã xem hết tất cả thông báo. Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới."
  />
);

export const NoAppointments = ({ onBook }: { onBook?: () => void }) => (
  <EmptyState
    icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có lịch hẹn"
    description="Bạn chưa đặt lịch hẹn nào. Đặt lịch tư vấn hoặc xem dự án ngay hôm nay."
    action={onBook ? { label: "Đặt lịch hẹn", onClick: onBook } : undefined}
  />
);

export const NoDevelopers = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<Users className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có chủ đầu tư"
    description="Hiện chưa có thông tin chủ đầu tư nào. Thêm chủ đầu tư để quản lý tốt hơn."
    action={onCreate ? { label: "Thêm chủ đầu tư", onClick: onCreate } : undefined}
  />
);

export const NoData = () => (
  <EmptyState
    icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
    title="Không có dữ liệu"
    description="Hiện chưa có dữ liệu để hiển thị."
  />
);

export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<AlertCircle className="h-12 w-12 text-destructive" />}
    title="Đã xảy ra lỗi"
    description="Không thể tải dữ liệu. Vui lòng thử lại sau."
    action={onRetry ? { label: "Thử lại", onClick: onRetry } : undefined}
  />
);

export const NoMarketData = () => (
  <EmptyState
    icon={<TrendingUp className="h-12 w-12 text-muted-foreground" />}
    title="Chưa có dữ liệu thị trường"
    description="Dữ liệu phân tích thị trường sẽ được cập nhật sớm."
  />
);
