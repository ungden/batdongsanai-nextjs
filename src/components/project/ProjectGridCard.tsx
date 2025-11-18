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
      className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Image with gradient overlays */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 opacity-50" />
        
        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />

        {/* Status/Sold badge with glow effect */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {typeof soldPercentage === "number" ? (
            <div className="relative">
              <div className="absolute inset-0 bg-success/50 blur-lg rounded-lg" />
              <span className="relative bg-gradient-to-r from-success to-success/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-success/30 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {soldPercentage}% đã bán
              </span>
            </div>
          ) : null}
        </div>

        {/* Favorite with backdrop */}
        <div className="absolute top-4 right-4 z-10 backdrop-blur-sm bg-white/20 rounded-full p-1" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* Content with gradient background */}
      <div className="relative p-6 bg-gradient-to-br from-card via-card to-muted/20">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        {/* Title & meta */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-2">
            {project.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="p-1 bg-primary/10 rounded-lg mr-2">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="line-clamp-1 font-medium">{project.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="p-1 bg-accent/10 rounded-lg mr-2">
                <User className="w-4 h-4 text-accent" />
              </div>
              <span className="line-clamp-1 font-medium">{project.developer}</span>
            </div>
          </div>

          {/* Badges with icons */}
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

        {/* Pricing with gradient card */}
        <div className="mt-4 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-4 shadow-inner">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                {project.priceRange}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatPrice(project.pricePerSqm)} VNĐ/m²
              </div>
            </div>
            {priceTrend && (
              <div className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-lg ${
                priceTrend === "up" 
                  ? "text-success bg-success/10 border border-success/20" 
                  : priceTrend === "down" 
                  ? "text-destructive bg-destructive/10 border border-destructive/20" 
                  : "text-muted-foreground bg-muted/30"
              }`}>
                {priceTrend === "up" ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : priceTrend === "down" ? (
                  <TrendingDown className="w-5 h-5 mr-1" />
                ) : null}
                {priceTrend === "up" ? "Tăng giá" : priceTrend === "down" ? "Giảm nhẹ" : "Ổn định"}
              </div>
            )}
          </div>
        </div>

        {/* Progress with gradient */}
        <div className="mt-5 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">Tiến độ xây dựng</span>
            <span className="font-semibold text-primary">{Math.round(completionProgress)}%</span>
          </div>
          <Progress value={completionProgress} className="h-2.5" />
        </div>

        {/* Footer with gradient background */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-border/50 px-2 py-2 rounded-lg bg-gradient-to-r from-muted/20 to-muted/30">
          <Badge variant="outline" className="font-semibold text-primary border-primary/30 shadow-sm">
            <Award className="w-4 h-4 mr-1 text-primary" /> {project.legalScore}/10
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="p-0.5 bg-primary/10 rounded mr-1">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">{project.completionDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectGridCard;