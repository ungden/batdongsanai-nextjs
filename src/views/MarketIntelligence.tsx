"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Building2,
  DollarSign,
  Scale,
  Landmark,
  Construction,
  AlertCircle,
  BarChart3,
  Activity,
  Sparkles
} from 'lucide-react';
import {
  useMarketCatalysts,
  useMarketRegulations,
  useInfrastructure
} from '@/hooks/useMarketData';
import { formatCurrency, formatCompactCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MarketIntelligence = () => {
  const isMobile = useIsMobile();
  const navigate = useRouter();
  const [selectedArea, setSelectedArea] = useState<string>('');

  const { catalysts, loading: catalystsLoading } = useMarketCatalysts({
    area: selectedArea || undefined
  });

  const { regulations, loading: regulationsLoading } = useMarketRegulations({
    area: selectedArea || undefined
  });

  const { infrastructure, loading: infrastructureLoading } = useInfrastructure({
    district: selectedArea || undefined,
    status: 'under_construction'
  });

  // Calculate market stats
  const positiveCatalysts = catalysts.filter(c => c.impact_direction === 'positive').length;
  const negativeCatalysts = catalysts.filter(c => c.impact_direction === 'negative').length;
  const highImpactCount = catalysts.filter(c => c.impact_level === 'very_high' || c.impact_level === 'high').length;

  const getImpactColor = (direction: string) => {
    switch (direction) {
      case 'positive':
        return 'text-success bg-success/10';
      case 'negative':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getImpactIcon = (direction: string) => {
    switch (direction) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const content = (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Market Intelligence</h1>
            <p className="text-muted-foreground mt-1">
              Phân tích thị trường & yếu tố tác động giá
            </p>
          </div>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Catalysts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{catalysts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {highImpactCount} tác động cao
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Tích cực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{positiveCatalysts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yếu tố tăng giá
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Tiêu cực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{negativeCatalysts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yếu tố giảm giá
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Construction className="h-4 w-4" />
              Hạ tầng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{infrastructure.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang xây dựng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="catalysts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalysts">
            <Zap className="h-4 w-4 mr-2" />
            Catalysts
          </TabsTrigger>
          <TabsTrigger value="infrastructure">
            <Construction className="h-4 w-4 mr-2" />
            Hạ tầng
          </TabsTrigger>
          <TabsTrigger value="regulations">
            <Scale className="h-4 w-4 mr-2" />
            Chính sách
          </TabsTrigger>
        </TabsList>

        {/* CATALYSTS TAB */}
        <TabsContent value="catalysts" className="space-y-4 mt-6">
          {catalystsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : catalysts.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có dữ liệu catalyst</p>
            </Card>
          ) : (
            catalysts.map((catalyst) => (
              <Card key={catalyst.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {catalyst.catalyst_type}
                        </Badge>
                        <Badge className={getImpactColor(catalyst.impact_direction)}>
                          {getImpactIcon(catalyst.impact_direction)}
                          <span className="ml-1">{catalyst.impact_direction}</span>
                        </Badge>
                        <Badge variant="secondary">
                          {catalyst.impact_level}
                        </Badge>
                        {catalyst.verification_status === 'verified' && (
                          <Badge className="bg-success/10 text-success">
                            Đã xác minh
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2">
                        {catalyst.title}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4">
                        {catalyst.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {catalyst.announcement_date && (
                          <div>
                            <span className="text-muted-foreground">Công bố:</span>
                            <div className="font-medium">
                              {format(new Date(catalyst.announcement_date), 'dd/MM/yyyy', { locale: vi })}
                            </div>
                          </div>
                        )}
                        {catalyst.effective_date && (
                          <div>
                            <span className="text-muted-foreground">Hiệu lực:</span>
                            <div className="font-medium">
                              {format(new Date(catalyst.effective_date), 'dd/MM/yyyy', { locale: vi })}
                            </div>
                          </div>
                        )}
                        {catalyst.estimated_price_impact_percent && (
                          <div>
                            <span className="text-muted-foreground">Tác động giá:</span>
                            <div className={`font-medium ${catalyst.estimated_price_impact_percent > 0 ? 'text-success' : 'text-destructive'}`}>
                              {catalyst.estimated_price_impact_percent > 0 ? '+' : ''}
                              {catalyst.estimated_price_impact_percent}%
                            </div>
                          </div>
                        )}
                        {catalyst.affected_areas && catalyst.affected_areas.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Khu vực:</span>
                            <div className="font-medium">
                              {catalyst.affected_areas.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      {catalyst.source_url && (
                        <div className="mt-4">
                          <a
                            href={catalyst.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Nguồn →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* INFRASTRUCTURE TAB */}
        <TabsContent value="infrastructure" className="space-y-4 mt-6">
          {infrastructureLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : infrastructure.length === 0 ? (
            <Card className="p-12 text-center">
              <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có dữ liệu hạ tầng</p>
            </Card>
          ) : (
            infrastructure.map((item) => (
              <Card key={item.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Construction className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.infrastructure_type}</Badge>
                        <Badge className={
                          item.status === 'completed' ? 'bg-success text-white' :
                          item.status === 'under_construction' ? 'bg-warning text-white' :
                          'bg-muted'
                        }>
                          {item.status}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>

                      {item.description && (
                        <p className="text-muted-foreground text-sm mb-4">
                          {item.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {item.location_district && (
                          <div>
                            <span className="text-muted-foreground">Khu vực:</span>
                            <div className="font-medium">{item.location_district}</div>
                          </div>
                        )}
                        {item.expected_completion && (
                          <div>
                            <span className="text-muted-foreground">Hoàn thành dự kiến:</span>
                            <div className="font-medium">
                              {format(new Date(item.expected_completion), 'MM/yyyy', { locale: vi })}
                            </div>
                          </div>
                        )}
                        {item.budget_vnd && (
                          <div>
                            <span className="text-muted-foreground">Ngân sách:</span>
                            <div className="font-medium">
                              {formatCompactCurrency(item.budget_vnd)}
                            </div>
                          </div>
                        )}
                        {item.estimated_property_impact_percent && (
                          <div>
                            <span className="text-muted-foreground">Tác động:</span>
                            <div className="font-medium text-success">
                              +{item.estimated_property_impact_percent}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* REGULATIONS TAB */}
        <TabsContent value="regulations" className="space-y-4 mt-6">
          {regulationsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : regulations.length === 0 ? (
            <Card className="p-12 text-center">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có dữ liệu chính sách</p>
            </Card>
          ) : (
            regulations.map((regulation) => (
              <Card key={regulation.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Scale className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{regulation.regulation_type}</Badge>
                        {regulation.issuing_authority && (
                          <Badge variant="secondary">{regulation.issuing_authority}</Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2">{regulation.title}</h3>

                      <p className="text-muted-foreground text-sm mb-4">
                        {regulation.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Ngày hiệu lực:</span>
                          <div className="font-medium">
                            {format(new Date(regulation.effective_date), 'dd/MM/yyyy', { locale: vi })}
                          </div>
                        </div>
                        {regulation.regulation_number && (
                          <div>
                            <span className="text-muted-foreground">Số văn bản:</span>
                            <div className="font-medium">{regulation.regulation_number}</div>
                          </div>
                        )}
                      </div>

                      {(regulation.impact_on_buyers || regulation.impact_on_investors) && (
                        <div className="mt-4 space-y-2">
                          {regulation.impact_on_buyers && (
                            <div className="text-sm">
                              <span className="font-medium">Tác động người mua:</span>
                              <p className="text-muted-foreground">{regulation.impact_on_buyers}</p>
                            </div>
                          )}
                          {regulation.impact_on_investors && (
                            <div className="text-sm">
                              <span className="font-medium">Tác động nhà đầu tư:</span>
                              <p className="text-muted-foreground">{regulation.impact_on_investors}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {regulation.document_url && (
                        <div className="mt-4">
                          <a
                            href={regulation.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Xem văn bản →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">{content}</div>
        <BottomNavigation />
      </div>
    );
  }

  return <DesktopLayout>{content}</DesktopLayout>;
};

export default MarketIntelligence;
