import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  User, 
  TrendingUp, 
  TrendingDown,
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
        <div className="flex h-[140px]">
          {/* Left Image Section - Reduced width */}
          <div className="relative w-[110px] flex-shrink-0 overflow-hidden border-r border-border">
            <img 
              src={project.image} 
              alt={project.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Sold Badge */}
            {soldPercentage && (
              <div className="absolute top-1 left-1">
                <Badge className="bg-emerald-600/90 text-white border-0 text-[9px] px-1 py-0.5 backdrop-blur-sm">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  {soldPercentage}%
                </Badge>
              </div>
            )}
          </div>

          {/* Right Content Section - Tighter spacing */}
          <div className="flex-1 p-2.5 flex flex-col justify-between bg-card relative">
            <div className="space-y-1">
              <h3 className="font-bold text-sm leading-tight text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0 opacity-70" />
                <span className="line-clamp-1 text-[11px]">{project.location}</span>
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {badges.slice(0, 2).map((b) => (
                    <Badge key={b} variant={b === 'hot' ? 'premium' : 'secondary'} className="text-[9px] px-1 py-0 h-4 font-normal border-0">
                      {b === 'hot' ? 'Hot' : b === 'new' ? 'Mới' : b === 'discount' ? 'Giảm' : 'Nổi bật'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto">
               <div className="text-base font-bold text-primary leading-none">
                 {project.priceRange.split(' ')[0]} <span className="text-xs font-normal text-muted-foreground">tỷ</span>
               </div>
               <div className="text-[10px] text-muted-foreground mt-0.5">
                 {formatPrice(project.pricePerSqm)} /m²
               </div>
            </div>
            
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton projectId={project.id} projectName={project.name} className="h-6 w-6" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Desktop Layout - Compacted
  return (
    <Card 
      className="w-full overflow-hidden group border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(project.id)}
    >
      <div className="flex h-[200px]">
        {/* Hero Image Section */}
        <div className="relative w-[240px] flex-shrink-0 overflow-hidden border-r border-border bg-muted">
          <img 
            src={project.image} 
            alt={project.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {soldPercentage && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-emerald-600/90 text-white border-0 backdrop-blur-sm shadow-sm font-medium text-xs px-2 py-0.5">
                <TrendingUp className="w-3 h-3 mr-1" />
                {soldPercentage}% đã bán
              </Badge>
            </div>
          )}

          {project.warnings.length > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-destructive/90 text-white border-0 backdrop-blur-sm shadow-sm h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px]">
                {project.warnings.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between bg-card relative">
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground">
                   <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                   <span className="truncate">{project.location}</span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton projectId={project.id} projectName={project.name} className="h-7 w-7" />
              </div>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              <span className="font-medium">{project.developer}</span>
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {badges.map((b) => (
                  <Badge key={b} variant={b === 'hot' ? 'premium' : b === 'new' ? 'secondary' : b === 'discount' ? 'warning' : 'default'} className="text-[10px] px-2 py-0 h-5 font-medium border-0">
                    <span className="inline-flex items-center gap-1">
                      {b === 'hot' && <Flame className="w-3 h-3" />}
                      {b === 'new' && <Sparkles className="w-3 h-3" />}
                      {b === 'discount' && <TrendingDown className="w-3 h-3" />}
                      {b === 'featured' && <Star className="w-3 h-3" />}
                      {b === 'hot' ? 'Hot' : b === 'new' ? 'Mới' : b === 'discount' ? 'Giảm' : 'Nổi bật'}
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-3 pt-3 border-t border-border/60">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-primary">{project.priceRange}</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatPrice(project.pricePerSqm)} VNĐ/m²
              </div>
            </div>

            {priceTrend && (
               <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${
                 priceTrend === 'up' 
                   ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900' 
                   : priceTrend === 'down' 
                   ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900' 
                   : 'text-muted-foreground bg-muted border-border'
               }`}>
                 {priceTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                  priceTrend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                 <span>{priceTrend === 'up' ? 'Tăng' : priceTrend === 'down' ? 'Giảm' : 'Ổn định'}</span>
               </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
             <div className="flex-1 max-w-[140px] space-y-1">
               <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                 <span>Tiến độ</span>
                 <span className="text-foreground">{Math.round(completionProgress)}%</span>
               </div>
               <Progress value={completionProgress} className="h-1" />
             </div>

             <div className="flex items-center gap-3">
                <StatusBadge variant={getStatusVariant(project.status)} className="h-5 px-2 text-[10px] font-semibold">
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