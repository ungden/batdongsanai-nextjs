import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FavoriteButton from "./FavoriteButton";
import { Project } from "@/types/project";
import { MapPin, User, TrendingUp, TrendingDown, Calendar, ArrowRight, Minus, Building } from "lucide-react";
import { getProjectBadges } from "@/utils/projectBadges";
import { getProjectPhase, getPriceTrendColor } from "@/utils/projectPhases";

interface ProjectGridCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectGridCard = ({ project, onClick }: ProjectGridCardProps) => {
  const { label: phaseLabel, color: phaseColor, phase } = getProjectPhase(project);
  
  const soldPercentage = project.totalUnits && project.soldUnits
    ? Math.round((project.soldUnits / project.totalUnits) * 100)
    : undefined;

  const priceTrend = (() => {
    if (!project.priceHistory || project.priceHistory.length < 2) return null;
    const latest = project.priceHistory[project.priceHistory.length - 1].price;
    const previous = project.priceHistory[project.priceHistory.length - 2].price;
    return latest > previous ? "up" : latest < previous ? "down" : "stable";
  })();

  const trendColorClass = getPriceTrendColor(priceTrend);

  const completionProgress = (() => {
    if (project.completionDate === "Đã hoàn thành") return 100;
    if (!project.launchDate) return 0;
    const currentDate = new Date();
    // Handle generic formats slightly better
    const yearMatch = project.completionDate.match(/\d{4}/);
    const targetYear = yearMatch ? parseInt(yearMatch[0]) : currentDate.getFullYear() + 2;
    
    const targetDate = new Date(targetYear, 11, 31);
    const launchDate = new Date(project.launchDate);
    const totalDuration = targetDate.getTime() - launchDate.getTime();
    const elapsed = currentDate.getTime() - launchDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  })();

  const badges = getProjectBadges(project);

  return (
    <Card
      onClick={() => onClick(project.id)}
      className="group overflow-hidden cursor-pointer bg-card border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl"
    >
      {/* Image Section */}
      <div className="relative h-[220px] overflow-hidden bg-muted">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
        
        {/* Phase Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${phaseColor} border-0 shadow-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider`}>
            {phaseLabel}
          </Badge>
        </div>

        {/* Favorite (Top Right) */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
           <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-1.5 transition-colors border border-white/10">
             <FavoriteButton projectId={project.id} projectName={project.name} className="text-white hover:text-white h-5 w-5" />
           </div>
        </div>

        {/* Bottom Info Over Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
           <h3 className="text-lg font-bold leading-snug mb-1 shadow-black/50 drop-shadow-md line-clamp-1 group-hover:text-primary-foreground transition-colors">
            {project.name}
          </h3>
           <div className="flex items-center text-xs text-white/90 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Developer & Progress Row */}
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <User className="w-3.5 h-3.5 mr-1.5" />
              <span className="font-medium truncate max-w-[100px]">{project.developer}</span>
            </div>
            {typeof soldPercentage === 'number' && (
               <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Đã bán:</span>
                  <span className="text-primary font-bold">{soldPercentage}%</span>
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${soldPercentage}%` }} />
                  </div>
               </div>
            )}
        </div>

        {/* Pricing Section - Highlighted */}
        <div className="flex items-center justify-between py-2 border-b border-dashed border-border/60">
            <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-0.5">Giá tham khảo</p>
                <div className="text-lg font-black text-primary">
                    {project.priceRange.split(' ')[0]} <span className="text-sm font-normal text-muted-foreground">tỷ</span>
                </div>
            </div>
             <div className="text-right">
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-0.5">Đơn giá / m²</p>
                 <div className="text-sm font-bold text-foreground">
                    {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(project.pricePerSqm / 1000000)} tr
                 </div>
            </div>
        </div>

        {/* Price Trend & Legal Status */}
        <div className="flex items-center justify-between">
           {/* Price Trend Badge */}
           {priceTrend ? (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold ${trendColorClass}`}>
                {priceTrend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : 
                 priceTrend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : 
                 <Minus className="w-3.5 h-3.5" />}
                <span>
                  {priceTrend === 'up' ? 'Tăng nhẹ' : 
                   priceTrend === 'down' ? 'Giảm giá' : 'Ổn định'}
                </span>
              </div>
           ) : (
             <div className="text-xs text-muted-foreground font-medium">Chưa có dữ liệu giá</div>
           )}
           
           {/* Legal Score */}
           <div className={`flex items-center gap-1.5 text-xs font-bold ${
             project.legalScore >= 8 ? "text-emerald-600" : 
             project.legalScore >= 5 ? "text-amber-600" : "text-rose-600"
           }`}>
              <Building className="w-3.5 h-3.5" />
              PL: {project.legalScore}/10
           </div>
        </div>

        {/* Footer Action */}
        <div className="pt-1">
           <div className="w-full py-2 flex items-center justify-center text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
             Xem chi tiết <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
           </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectGridCard;