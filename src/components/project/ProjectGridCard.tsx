import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FavoriteButton from "./FavoriteButton";
import { Project } from "@/types/project";
import { MapPin, User, TrendingUp, TrendingDown, Calendar, Star, Flame, Sparkles, Award, ArrowRight } from "lucide-react";
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
      className="group overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl"
    >
      {/* Image with gradient overlays */}
      <div className="relative h-[240px] overflow-hidden bg-muted">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        {/* Status/Sold badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {typeof soldPercentage === "number" && soldPercentage > 0 ? (
            <Badge className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-0 backdrop-blur-md shadow-sm font-semibold px-2.5">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              {soldPercentage}% đã bán
            </Badge>
          ) : null}
        </div>

        {/* Favorite with backdrop */}
        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
           <div className="bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full p-1 transition-colors">
             <FavoriteButton projectId={project.id} projectName={project.name} className="text-white hover:text-white" />
           </div>
        </div>

        {/* Bottom Info Over Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
           <h3 className="text-xl font-bold leading-snug mb-1 shadow-black/50 drop-shadow-md line-clamp-1">
            {project.name}
          </h3>
           <div className="flex items-center text-sm text-white/90">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              <span className="truncate font-medium">{project.location}</span>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium truncate max-w-[140px]">{project.developer}</span>
            </div>
             <div className="flex items-center text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">{project.completionDate}</span>
            </div>
        </div>

        {/* Pricing Section */}
        <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3 border border-border/50">
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase mb-0.5">Giá bán</p>
                <div className="text-xl font-bold text-primary">
                    {project.priceRange}
                </div>
            </div>
             <div className="text-right">
                 <p className="text-xs text-muted-foreground font-medium uppercase mb-0.5">Đơn giá</p>
                 <div className="text-sm font-semibold text-foreground">
                    {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(project.pricePerSqm / 1000000)} tr/m²
                 </div>
            </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Tiến độ xây dựng</span>
            <span className="font-bold text-primary">{Math.round(completionProgress)}%</span>
          </div>
          <Progress value={completionProgress} className="h-1.5 bg-muted" />
        </div>

        {/* Badges & Action */}
        <div className="flex items-center justify-between pt-2">
           <div className="flex gap-1.5">
              {badges.slice(0, 2).map((b) => (
                <Badge 
                  key={b} 
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border-border"
                >
                  {b === 'hot' ? 'Hot' : b === 'new' ? 'Mới' : b === 'discount' ? 'Giảm giá' : 'Nổi bật'}
                </Badge>
              ))}
              {project.legalScore >= 8 && (
                 <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
                    Pháp lý tốt
                 </Badge>
              )}
           </div>
           
           <div className="group/btn flex items-center text-sm font-bold text-primary">
             Xem chi tiết <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
           </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectGridCard;