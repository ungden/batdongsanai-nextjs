import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  User, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Flame,
  Sparkles,
  Star,
  Award
} from "lucide-react";
import { Project } from "@/types/project";
import FavoriteButton from "./FavoriteButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { getProjectBadges } from "@/utils/projectBadges";

interface EnhancedProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const EnhancedProjectCard = ({ project, onClick }: EnhancedProjectCardProps) => {
  const isMobile = useIsMobile();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "good": return "success";
      case "warning": return "warning";
      case "danger": return "danger";
      default: return "neutral";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPriceTrend = () => {
    if (!project.priceHistory || project.priceHistory.length < 2) return null;
    const latest = project.priceHistory[project.priceHistory.length - 1].price;
    const previous = project.priceHistory[project.priceHistory.length - 2].price;
    return latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
  };

  const getCompletionProgress = () => {
    if (project.completionDate === "Đã hoàn thành") return 100;
    const currentDate = new Date();
    const targetDate = new Date(project.completionDate.replace(/Q\d\//, '12/31/'));
    const launchDate = new Date(project.launchDate || '2023-01-01');
    const totalDuration = targetDate.getTime() - launchDate.getTime();
    const elapsed = currentDate.getTime() - launchDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getSoldPercentage = () => {
    if (!project.totalUnits || !project.soldUnits) return null;
    return Math.round((project.soldUnits / project.totalUnits) * 100);
  };

  const priceTrend = getPriceTrend();
  const completionProgress = getCompletionProgress();
  const soldPercentage = getSoldPercentage();
  const badges = getProjectBadges(project);

  if (isMobile) {
    return (
      <Card 
        className="w-full max-w-sm mx-auto overflow-hidden group border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={() => onClick(project.id)}
      >
        <div className="flex h-[180px]">
          {/* Left Image Section */}
          <div className="relative w-[130px] flex-shrink-0 overflow-hidden border-r border-border">
            <img 
              src={project.image} 
              alt={project.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Sold Badge */}
            {soldPercentage && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-emerald-600/90 text-white border-0 text-[10px] px-1.5 py-0.5 backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {soldPercentage}%
                </Badge>
              </div>
            )}
          </div>

          {/* Right Content Section */}
          <div className="flex-1 p-3 flex flex-col justify-between bg-card relative">
            <div className="space-y-2">
              <h3 className="font-bold text-sm leading-tight text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  <span className="line-clamp-1">{project.location}</span>
                </div>
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {badges.slice(0, 2).map((b) => (
                    <Badge key={b} variant={b === 'hot' ? 'premium' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                      {b === 'hot' ? 'Hot' : b === 'new' ? 'Mới' : b === 'discount' ? 'Giảm' : 'Nổi bật'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mt-auto">
              <div className="space-y-0.5">
                 <div className="text-base font-bold text-primary leading-none">
                   {project.priceRange.split(' ')[0]} <span className="text-xs font-normal text-muted-foreground">tỷ</span>
                 </div>
                 <div className="text-[10px] text-muted-foreground">
                   {formatPrice(project.pricePerSqm)} /m²
                 </div>
              </div>
            </div>
            
            <div className="absolute bottom-3 right-3">
                <FavoriteButton projectId={project.id} projectName={project.name} className="h-7 w-7" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card 
      className="w-full overflow-hidden group border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(project.id)}
    >
      <div className="flex h-[220px]">
        {/* Hero Image Section */}
        <div className="relative w-[260px] flex-shrink-0 overflow-hidden border-r border-border bg-muted">
          <img 
            src={project.image} 
            alt={project.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {soldPercentage && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-emerald-600/90 text-white border-0 backdrop-blur-sm shadow-sm font-semibold">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {soldPercentage}% đã bán
              </Badge>
            </div>
          )}

          {project.warnings.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-destructive/90 text-white border-0 backdrop-blur-sm shadow-sm h-6 w-6 rounded-full flex items-center justify-center p-0">
                {project.warnings.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-card relative">
          
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-xl text-card-foreground group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                   <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                   <span className="truncate">{project.location}</span>
                </div>
              </div>
              <FavoriteButton projectId={project.id} projectName={project.name} className="h-8 w-8" />
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-1.5 opacity-70" />
              <span className="font-medium">{project.developer}</span>
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {badges.map((b) => (
                  <Badge key={b} variant={b === 'hot' ? 'premium' : b === 'new' ? 'secondary' : b === 'discount' ? 'warning' : 'default'} className="text-xs px-2.5 py-0.5 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {b === 'hot' && <Flame className="w-3 h-3" />}
                      {b === 'new' && <Sparkles className="w-3 h-3" />}
                      {b === 'discount' && <TrendingDown className="w-3 h-3" />}
                      {b === 'featured' && <Star className="w-3 h-3" />}
                      {b === 'hot' ? 'Hot' : b === 'new' ? 'Mới' : b === 'discount' ? 'Giảm giá' : 'Nổi bật'}
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-4 pt-4 border-t border-border">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{project.priceRange}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-0.5">
                {formatPrice(project.pricePerSqm)} VNĐ/m²
              </div>
            </div>

            {priceTrend && (
               <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                 priceTrend === 'up' 
                   ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900' 
                   : priceTrend === 'down' 
                   ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900' 
                   : 'text-muted-foreground bg-muted border-border'
               }`}>
                 {priceTrend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                  priceTrend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                 <span>{priceTrend === 'up' ? 'Tăng giá' : priceTrend === 'down' ? 'Giảm giá' : 'Ổn định'}</span>
               </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
             <div className="flex-1 max-w-[180px] space-y-1.5">
               <div className="flex justify-between text-xs font-medium text-muted-foreground">
                 <span>Tiến độ</span>
                 <span className="text-foreground">{Math.round(completionProgress)}%</span>
               </div>
               <Progress value={completionProgress} className="h-1.5" />
             </div>

             <div className="flex items-center gap-3">
                <StatusBadge variant={getStatusVariant(project.status)} className="h-6 px-2 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {project.legalScore}/10
                </StatusBadge>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedProjectCard;