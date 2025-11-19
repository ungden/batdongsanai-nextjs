import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FavoriteButton from "./FavoriteButton";
import { Project } from "@/types/project";
import { MapPin, User, TrendingUp, TrendingDown, Calendar, Star, Flame, Sparkles, Award } from "lucide-react";
import { getProjectBadges } from "@/utils/projectBadges";

interface ProjectGridCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectGridCard = ({ project, onClick }: ProjectGridCardProps) => {
  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price);

  const soldPercentage = project.totalUnits && project.soldUnits
    ? Math.round((project.soldUnits / project.totalUnits) * 100)
    : undefined;

  const priceTrend = (() => {
    if (!project.priceHistory || project.priceHistory.length < 2) return null;
    const latest = project.priceHistory[project.priceHistory.length - 1].price;
    const previous = project.priceHistory[project.priceHistory.length - 2].price;
    return latest > previous ? "up" : latest < previous ? "down" : "stable";
  })();

  const completionProgress = (() => {
    if (project.completionDate === "Đã hoàn thành") return 100;
    if (!project.launchDate) return 0;
    const currentDate = new Date();
    const targetDate = new Date(project.completionDate.replace(/Q\d\//, "12/31/"));
    const launchDate = new Date(project.launchDate);
    const totalDuration = targetDate.getTime() - launchDate.getTime();
    const elapsed = currentDate.getTime() - launchDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  })();

  const badges = getProjectBadges(project);

  return (
    <Card
      onClick={() => onClick(project.id)}
      className="overflow-hidden cursor-pointer group border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300"
    >
      {/* Image with gradient overlays */}
      <div className="relative h-[220px] overflow-hidden bg-muted">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        
        {/* Status/Sold badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {typeof soldPercentage === "number" ? (
            <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {soldPercentage}% đã bán
            </Badge>
          ) : null}
        </div>

        {/* Favorite with backdrop */}
        <div className="absolute top-4 right-4 z-10 bg-black/20 backdrop-blur-md rounded-full p-1 hover:bg-black/40 transition-colors" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title & meta */}
        <div>
          <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {project.name}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 text-primary/70" />
              <span className="line-clamp-1">{project.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-2 text-accent/70" />
              <span className="line-clamp-1">{project.developer}</span>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge 
                  key={b} 
                  variant={b === 'hot' ? 'premium' : b === 'new' ? 'secondary' : b === 'discount' ? 'warning' : 'default'} 
                  className="text-[10px] px-2 py-0.5 shadow-sm"
                >
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

        {/* Pricing Card */}
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-primary mb-0.5">
                {project.priceRange}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatPrice(project.pricePerSqm)} VNĐ/m²
              </div>
            </div>
            {priceTrend && (
              <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border ${
                priceTrend === "up" 
                  ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900" 
                  : priceTrend === "down" 
                  ? "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900" 
                  : "text-muted-foreground bg-muted border-border"
              }`}>
                {priceTrend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : priceTrend === "down" ? (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                ) : null}
                {priceTrend === "up" ? "Tăng giá" : priceTrend === "down" ? "Giảm nhẹ" : "Ổn định"}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Tiến độ xây dựng</span>
            <span className="font-semibold text-foreground">{Math.round(completionProgress)}%</span>
          </div>
          <Progress value={completionProgress} className="h-1.5" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Badge variant="outline" className="font-medium text-foreground border-border">
            <Award className="w-3.5 h-3.5 mr-1 text-primary" /> {project.legalScore}/10
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>{project.completionDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectGridCard;