import { useCompareStore } from '@/stores/compareStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ArrowRight,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Award,
  Star,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SEOHead from '@/components/seo/SEOHead';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const emptyState = (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="bg-muted/30 p-6 rounded-full">
        <Building2 className="h-16 w-16 text-muted-foreground/40" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Chưa có dự án để so sánh</h1>
        <p className="text-muted-foreground">
          Chọn tối đa 4 dự án để so sánh chi tiết về giá, pháp lý và tiềm năng đầu tư.
        </p>
      </div>
      <Button onClick={() => navigate('/explore')} size="lg" className="rounded-xl">
        <Plus className="mr-2 h-5 w-5" />
        Thêm dự án ngay
      </Button>
    </div>
  );

  if (compareList.length === 0) {
    if (isMobile) {
      return (
        <div className="min-h-screen bg-background p-4 pb-20">
          {emptyState}
          <BottomNavigation />
        </div>
      );
    }
    return (
      <DesktopLayout title="So sánh dự án">
        <SEOHead title="So sánh dự án" description="So sánh chi tiết các dự án bất động sản" />
        {emptyState}
      </DesktopLayout>
    );
  }

  const comparisonFields = [
    { label: 'Giá/m²', key: 'pricePerSqm', icon: DollarSign, format: (val: any) => formatCurrency(val), highlight: true },
    { label: 'Vị trí', key: 'location', icon: MapPin, format: (val: any) => val },
    { label: 'CĐT', key: 'developer', icon: Building2, format: (val: any) => val },
    { label: 'Pháp lý', key: 'legalStatus', icon: Award, format: (val: any) => val || 'N/A', renderBadge: true },
    { label: 'Bàn giao', key: 'completionDate', icon: Calendar, format: (val: any) => val || 'N/A' },
  ];

  const priceWinner = compareList.length > 0 
    ? Math.min(...compareList.map(p => p.pricePerSqm).filter(p => p > 0))
    : null;

  const content = (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">So sánh ({compareList.length})</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearCompare} className="text-destructive hover:bg-destructive/10">
            Xóa hết
          </Button>
          <Button size="sm" onClick={() => navigate('/explore')} className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" /> Thêm
          </Button>
        </div>
      </div>

      {/* Comparison Table Container */}
      <ScrollArea className="w-full border border-border rounded-xl bg-card shadow-sm flex-1">
        <div className="min-w-max pb-4">
          {/* Sticky Header Row (Projects) */}
          <div className="flex sticky top-0 z-10 bg-card shadow-sm border-b border-border">
            <div className="w-32 sm:w-48 p-4 font-bold bg-muted/10 border-r border-border flex items-center text-foreground">
              Tiêu chí
            </div>
            {compareList.map((project) => (
              <div key={project.id} className="w-48 sm:w-64 p-3 border-r border-border last:border-r-0 relative group bg-card">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-white"
                  onClick={() => removeFromCompare(project.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="h-24 w-full rounded-lg overflow-hidden mb-2 bg-muted">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Building2 className="h-8 w-8 opacity-20" /></div>
                  )}
                </div>
                
                <h3 
                  className="font-bold text-sm line-clamp-2 h-10 cursor-pointer hover:text-primary text-foreground"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {project.name}
                </h3>
              </div>
            ))}
            {/* Add Placeholder Slot */}
            {compareList.length < 4 && (
              <div className="w-48 sm:w-64 p-3 flex flex-col items-center justify-center text-muted-foreground gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => navigate('/explore')}>
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">Thêm dự án</span>
              </div>
            )}
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-border">
            {comparisonFields.map((field) => (
              <div key={field.key} className="flex">
                <div className="w-32 sm:w-48 p-3 sm:p-4 text-sm font-medium text-muted-foreground bg-muted/5 border-r border-border flex items-center gap-2 sticky left-0">
                  <field.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{field.label}</span>
                </div>
                
                {compareList.map((project) => {
                  const val = project[field.key];
                  const isWinner = field.highlight && val === priceWinner;
                  
                  return (
                    <div key={project.id} className={`w-48 sm:w-64 p-3 sm:p-4 text-sm border-r border-border flex items-center ${isWinner ? 'bg-green-50/50 dark:bg-green-900/20' : ''}`}>
                      {field.renderBadge && val ? (
                         <Badge variant="secondary" className="font-normal">{field.format(val)}</Badge>
                      ) : (
                         <span className={isWinner ? 'font-bold text-green-700 dark:text-green-400' : 'text-foreground'}>
                           {field.format(val)}
                           {isWinner && <Star className="inline-block w-3 h-3 ml-1 fill-current" />}
                         </span>
                      )}
                    </div>
                  );
                })}
                {compareList.length < 4 && <div className="w-48 sm:w-64" />}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Helper text for mobile */}
      {isMobile && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
          <ArrowRight className="h-3 w-3" />
          Vuốt ngang để xem thêm
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        {content}
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="So sánh dự án">
      <SEOHead title={`So sánh ${compareList.length} dự án`} description="Bảng so sánh chi tiết" />
      {content}
    </DesktopLayout>
  );
};

export default Compare;