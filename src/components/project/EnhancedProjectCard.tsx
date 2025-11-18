import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  User, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Wifi,
  Car,
  Dumbbell,
  TreePine,
  Heart,
  Eye,
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "good": return "Pháp lý đầy đủ";
      case "warning": return "Cần xem xét";
      case "danger": return "Có rủi ro";
      default: return "Chưa xác định";
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
        className="w-full max-w-sm mx-auto overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => onClick(project.id)}
      >
        {/* Mobile Layout */}
        <div className="flex h-[220px]">
          {/* Left Image Section */}
          <div className="relative w-[145px] flex-shrink-0 overflow-hidden rounded-l-xl">
            <img 
              src={project.image} 
              alt={project.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-60" />
            
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent rounded-bl-full" />
            
            {/* Green Sold Badge with glow */}
            {soldPercentage && (
              <div className="absolute top-3 left-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-success/50 blur-md rounded-full" />
                  <div className="relative bg-gradient-to-r from-success to-success/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-success/20 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {soldPercentage}%
                  </div>
                </div>
              </div>
            )}

            {/* Warning Badge */}
            {project.warnings.length > 0 && (
              <div className="absolute bottom-3 left-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/50 blur-md rounded-full" />
                  <div className="relative bg-gradient-to-r from-destructive to-destructive/90 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-destructive/20">
                    {project.warnings.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-br from-card via-card to-muted/20 relative">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary" />
            
            {/* Header Section */}
            <div className="space-y-2.5 pl-2">
              {/* Project Name */}
              <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              
              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="p-1 bg-primary/10 rounded mr-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="line-clamp-1 font-medium">{project.location}</span>
              </div>

              {/* Developer */}
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="p-1 bg-accent/10 rounded mr-2">
                  <User className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="line-clamp-1 font-medium">{project.developer}</span>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {badges.map((b) => (
                    <Badge key={b} variant={b === 'hot' ? 'premium' : b === 'new' ? 'secondary' : b === 'discount' ? 'warning' : 'default'} className="text-[10px] px-2 py-0.5">
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

            {/* Bottom Section */}
            <div className="space-y-3 pl-2">
              {/* Price Display with gradient */}
              <div className="space-y-1 p-2 rounded-lg bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
                <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {project.priceRange}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {formatPrice(project.pricePerSqm)} VNĐ/m²
                </div>
              </div>

              {/* Status & Legal Score Row */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30">
                <StatusBadge variant={getStatusVariant(project.status)} className="text-xs px-2.5 py-1 font-semibold shadow-sm">
                  <Award className="w-3 h-3 inline mr-1" />
                  {project.legalScore}/10
                </StatusBadge>
                <div className="text-xs text-muted-foreground flex items-center">
                  <div className="p-0.5 bg-primary/10 rounded mr-1">
                    <Calendar className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium">
                    {project.completionDate.length > 12 ? project.completionDate.substring(0, 10) + '...' : project.completionDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10 backdrop-blur-sm bg-white/20 rounded-full p-1" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton projectId={project.id} projectName={project.name} />
        </div>
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card 
      className="w-full overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={() => onClick(project.id)}
    >
      <div className="flex h-[320px]">
        {/* Hero Image Section */}
        <div className="relative w-[200px] flex-shrink-0 overflow-hidden rounded-l-xl">
          <img 
            src={project.image} 
            alt={project.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-60" />
          
          {/* Decorative corner */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-transparent rounded-br-full" />
          
          {/* Green Sold Badge with glow */}
          {soldPercentage && (
            <div className="absolute top-4 left-4">
              <div className="relative">
                <div className="absolute inset-0 bg-success/50 blur-lg rounded-lg" />
                <div className="relative bg-gradient-to-r from-success to-success/90 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-xl border border-success/30 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {soldPercentage}% đã bán
                </div>
              </div>
            </div>
          )}

          {/* Warning Badge */}
          {project.warnings.length > 0 && (
            <div className="absolute bottom-4 left-4">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/50 blur-lg rounded-full" />
                <div className="relative bg-gradient-to-r from-destructive to-destructive/90 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-xl border border-destructive/30">
                  {project.warnings.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-br from-card via-card to-muted/20 relative">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary" />
          
          {/* Header Section */}
          <div className="space-y-4 pl-3">
            {/* Title */}
            <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {project.name}
            </h3>

            {/* Location & Developer */}
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <div className="p-1.5 bg-primary/10 rounded-lg mr-3">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="line-clamp-1 font-medium">{project.location}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <div className="p-1.5 bg-accent/10 rounded-lg mr-3">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <span className="line-clamp-1 hover:text-primary cursor-pointer font-medium transition-colors duration-200">
                  {project.developer}
                </span>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {badges.map((b) => (
                    <Badge key={b} variant={b === 'hot' ? 'premium' : b === 'new' ? 'secondary' : b === 'discount' ? 'warning' : 'default'} className="text-[10px] px-2 py-0.5">
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

            {/* Price Section with gradient */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-4 rounded-xl border-2 border-primary/20 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                    {project.priceRange}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {formatPrice(project.pricePerSqm)} VNĐ/m²
                  </div>
                </div>
                {priceTrend && (
                  <div className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg ${
                    priceTrend === 'up' 
                      ? 'text-success bg-success/10 border border-success/20' 
                      : priceTrend === 'down' 
                      ? 'text-destructive bg-destructive/10 border border-destructive/20' 
                      : 'text-muted-foreground bg-muted/30'
                  }`}>
                    {priceTrend === 'up' ? <TrendingUp className="w-5 h-5 mr-1" /> : 
                     priceTrend === 'down' ? <TrendingDown className="w-5 h-5 mr-1" /> : null}
                    {priceTrend === 'up' ? 'Tăng giá' : priceTrend === 'down' ? 'Giảm giá' : 'Ổn định'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-4 pl-3">
            {/* Construction Progress */}
            {project.completionDate !== "Đã hoàn thành" && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Tiến độ xây dựng</span>
                  <span className="font-bold text-primary">{Math.round(completionProgress)}%</span>
                </div>
                <Progress value={completionProgress} className="h-2.5" />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/20 shadow-sm">
                <div className="text-lg font-bold text-primary mb-1 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" />
                  {project.legalScore}/10
                </div>
                <div className="text-xs text-muted-foreground font-medium">Điểm pháp lý</div>
              </div>
              <div className="text-center bg-muted/30 p-3 rounded-lg border border-border">
                <div className="text-sm font-bold text-foreground flex items-center justify-center">
                  <div className="p-0.5 bg-primary/10 rounded mr-1">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <span className="ml-1">
                    {project.completionDate.length > 10 ? project.completionDate.substring(0, 8) + '...' : project.completionDate}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Bàn giao</div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="p-2 rounded-lg bg-gradient-to-r from-muted/20 to-muted/30">
              <StatusBadge variant={getStatusVariant(project.status)} className="text-sm px-3 py-1.5 font-semibold w-full text-center shadow-sm">
                {getStatusText(project.status)}
              </StatusBadge>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10 backdrop-blur-sm bg-white/20 rounded-full p-1.5" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton projectId={project.id} projectName={project.name} />
        </div>
      </div>
    </Card>
  );
};

export default EnhancedProjectCard;