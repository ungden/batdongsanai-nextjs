import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/project/FavoriteButton";
import { Project } from "@/types/project";
import { MapPin, Calendar, TrendingUp } from "lucide-react";

interface CompactProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const CompactProjectCard = ({ project, onClick }: CompactProjectCardProps) => {
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "premium" | "warning" => {
    switch (status) {
      case "good": return "default";
      case "warning": return "warning";
      case "danger": return "destructive";
      default: return "outline";
    }
  };

  const getSoldPercentage = () => {
    if (!project.totalUnits || !project.soldUnits) return null;
    return Math.round((project.soldUnits / project.totalUnits) * 100);
  };

  const isUpcoming = new Date(project.completionDate) > new Date();
  const soldPercentage = getSoldPercentage();

  return (
    <Card 
      className="group overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer rounded-xl"
      onClick={() => onClick(project.id)}
    >
      <div className="flex">
        {/* Image Section - Left Side (Mobile optimized) */}
        <div className="relative w-32 h-auto min-h-[100px] md:w-40 bg-muted overflow-hidden shrink-0">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Status Badge Overlay */}
          <div className="absolute top-2 left-2">
             {soldPercentage ? (
                <Badge className="bg-emerald-600/90 text-white border-0 text-[10px] h-5 px-1.5 backdrop-blur-sm shadow-sm">
                   {soldPercentage}% bán
                </Badge>
             ) : isUpcoming ? (
                <Badge className="bg-blue-600/90 text-white border-0 text-[10px] h-5 px-1.5 backdrop-blur-sm shadow-sm">
                   Sắp mở
                </Badge>
             ) : null}
          </div>
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton projectId={project.id} projectName={project.name} className="h-6 w-6 -mr-1 -mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{project.district}, {project.city === "TP. Hồ Chí Minh" ? "TP.HCM" : project.city}</span>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
             <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-primary">{project.priceRange}</span>
             </div>
             
             <div className="flex items-center justify-between border-t border-border/50 pt-1.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                   <Calendar className="w-3 h-3" />
                   <span>{project.completionDate.length > 10 ? project.completionDate.substring(0, 7) : project.completionDate}</span>
                </div>
                <Badge variant={getStatusVariant(project.status)} className="text-[10px] h-4 px-1.5 border-0">
                  PL: {project.legalScore}/10
                </Badge>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompactProjectCard;