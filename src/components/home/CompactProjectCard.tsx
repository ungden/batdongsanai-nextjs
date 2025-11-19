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
      className="group overflow-hidden border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer rounded-xl"
      onClick={() => onClick(project.id)}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-[180px] w-full overflow-hidden bg-muted">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {soldPercentage && (
              <Badge className="bg-emerald-600 text-white border-0 shadow-sm hover:bg-emerald-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                {soldPercentage}% đã bán
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-blue-600 text-white border-0 shadow-sm hover:bg-blue-700">
                Sắp mở bán
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-30" onClick={(e) => e.stopPropagation()}>
             <FavoriteButton 
                projectId={project.id} 
                projectName={project.name} 
                className="bg-white/20 hover:bg-white/40 text-white border-white/20 backdrop-blur-md h-8 w-8"
             />
          </div>
          
          {/* Price on Image */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-white font-bold text-lg drop-shadow-md tracking-tight">
              {project.priceRange}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-base font-bold text-card-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {project.name}
          </h3>

          {/* Developer */}
          <div className="text-sm font-medium text-muted-foreground truncate">
            {project.developer}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Badge variant={getStatusVariant(project.status)} className="text-[10px] px-2 h-5 font-semibold">
                PL: {project.legalScore}/10
              </Badge>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {project.completionDate.length > 10 ? project.completionDate.substring(0, 7) + '...' : project.completionDate}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;