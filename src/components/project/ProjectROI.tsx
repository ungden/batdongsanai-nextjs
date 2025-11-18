import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Calendar, TrendingUp } from "lucide-react";
import { Project } from "@/types/project";
import { calculateROI, calculateAnnualizedROI, formatROIDisplay, getROIStatus, getROICategory } from "@/utils/roiCalculations";

interface ProjectROIProps {
  project: Project;
}

export const ProjectROI = ({ project }: ProjectROIProps) => {
  if (!project.launchPrice || !project.currentPrice || !project.launchDate) {
    return null;
  }

  const roi = calculateROI(project.launchPrice, project.currentPrice);
  const annualizedROI = calculateAnnualizedROI(project.launchPrice, project.currentPrice, project.launchDate);
  const roiStatus = getROIStatus(roi);
  const roiCategory = getROICategory(roi);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString("vi-VN");
  };

  const getROIIcon = () => {
    if (roiStatus === 'positive') return <ArrowUp className="h-4 w-4 text-success" />;
    if (roiStatus === 'negative') return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
  };

  const getROIBadgeVariant = () => {
    if (roiStatus === 'positive') return 'default' as const;
    if (roiStatus === 'negative') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-4">
      {/* ROI Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Hiệu suất đầu tư (ROI)</h3>
            {getROIIcon()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">ROI tổng cộng</div>
              <div className="text-xl font-bold text-success">
                {formatROIDisplay(roi)}
              </div>
              <Badge variant={getROIBadgeVariant()} className="text-xs mt-1">
                {roiCategory}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">ROI hàng năm</div>
              <div className="text-xl font-bold text-primary">
                {formatROIDisplay(annualizedROI)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Trung bình/năm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Card */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold mb-3">So sánh giá</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Giá mở bán</div>
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatPrice(project.launchPrice)}/m²
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(project.launchDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Giá hiện tại</div>
              <div className="text-lg font-bold text-primary">
                {formatPrice(project.currentPrice)}/m²
              </div>
              <div className="text-xs text-muted-foreground">Cập nhật gần nhất</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Example Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="text-base font-semibold mb-3">Ví dụ đầu tư (100m²)</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center bg-background border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Đầu tư ban đầu</div>
              <div className="font-semibold text-foreground">{formatPrice(project.launchPrice * 100)}</div>
            </div>
            <div className="text-center bg-background border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Giá trị hiện tại</div>
              <div className="font-semibold text-primary">{formatPrice(project.currentPrice * 100)}</div>
            </div>
            <div className="text-center bg-background border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Lợi nhuận</div>
              <div className={`font-semibold ${
                roi > 0 ? 'text-success' : roi < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {roi > 0 ? '+' : ''}{formatPrice((project.currentPrice - project.launchPrice) * 100)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};