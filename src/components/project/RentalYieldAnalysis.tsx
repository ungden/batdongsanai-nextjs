import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRentalData } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatCurrency';
import { Home, TrendingUp, Users, Calendar, Percent } from 'lucide-react';

interface RentalYieldAnalysisProps {
  projectId: string;
  purchasePrice?: number;
}

export const RentalYieldAnalysis = ({ projectId, purchasePrice = 0 }: RentalYieldAnalysisProps) => {
  const { rentalData, avgRentalYield, loading } = useRentalData(projectId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rentalData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Phân tích cho thuê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Chưa có dữ liệu thị trường cho thuê
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get latest rental data
  const latestData = rentalData[0];

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Phân tích cho thuê & Lợi nhuận
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rental Yield</div>
                  <div className="text-2xl font-bold text-primary">
                    {avgRentalYield.toFixed(2)}%
                  </div>
                </div>
                <Percent className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Giá thuê TB</div>
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(latestData.rental_price_avg || 0)}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Công suất</div>
                  <div className="text-2xl font-bold text-accent">
                    {(latestData.occupancy_rate || 0).toFixed(0)}%
                  </div>
                </div>
                <Users className="h-8 w-8 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rental Range */}
        {latestData.rental_price_min && latestData.rental_price_max && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Khoảng giá cho thuê</div>
            <div className="flex items-center justify-between text-sm">
              <span>{formatCurrency(latestData.rental_price_min)}</span>
              <span>{formatCurrency(latestData.rental_price_max)}</span>
            </div>
            <Progress
              value={50}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground text-center">
              Trung bình: {formatCurrency(latestData.rental_price_avg || 0)}/tháng
            </div>
          </div>
        )}

        {/* Unit Type Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Chi tiết theo loại căn</div>
          {rentalData.slice(0, 5).map((data, index) => (
            <div
              key={data.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <div className="font-medium text-sm">{data.unit_type}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {data.tenant_profile && (
                    <Badge variant="outline" className="text-xs">
                      {data.tenant_profile}
                    </Badge>
                  )}
                  {data.seasonal_demand && (
                    <Badge
                      variant="secondary"
                      className={
                        data.seasonal_demand === 'high'
                          ? 'bg-success/10 text-success'
                          : data.seasonal_demand === 'low'
                          ? 'bg-muted'
                          : ''
                      }
                    >
                      {data.seasonal_demand} demand
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(data.rental_price_avg || 0)}
                </div>
                {data.yield_percentage && (
                  <div className="text-xs text-success">
                    Yield: {data.yield_percentage}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        {latestData.average_lease_term_months && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Thời gian thuê trung bình: </span>
              <span className="font-medium">{latestData.average_lease_term_months} tháng</span>
            </div>
          </div>
        )}

        {/* ROI Calculation */}
        {purchasePrice > 0 && latestData.rental_price_avg && (
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2">Dự tính lợi nhuận cho thuê</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Thu nhập/tháng</div>
                  <div className="font-semibold">
                    {formatCurrency(latestData.rental_price_avg)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Thu nhập/năm</div>
                  <div className="font-semibold">
                    {formatCurrency(latestData.rental_price_avg * 12)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Giá mua</div>
                  <div className="font-semibold">{formatCurrency(purchasePrice)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ROI hàng năm</div>
                  <div className="font-semibold text-success">
                    {((latestData.rental_price_avg * 12) / purchasePrice * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
