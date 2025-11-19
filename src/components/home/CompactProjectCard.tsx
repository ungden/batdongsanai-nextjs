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
      className="card-modern cursor-pointer group overflow-hidden border-border/60 bg-card hover:border-primary/50 transition-all duration-300"
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
          
          {/* Gradient overlay for text readability on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {soldPercentage && (
              <Badge className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-0 backdrop-blur-sm shadow-sm">
                <TrendingUp className="w-3 h-3 mr-1" />
                {soldPercentage}% đã bán
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-blue-500/90 hover:bg-blue-600 text-white border-0 backdrop-blur-sm shadow-sm">
                Sắp mở bán
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-30">
            <div className="bg-black/20 backdrop-blur-md rounded-full p-1 hover:bg-black/40 transition-colors">
              <FavoriteButton projectId={project.id} projectName={project.name} />
            </div>
          </div>
          
          {/* Price on Image (Mobile friendly) */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-white font-bold text-lg drop-shadow-md">
              {project.priceRange}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {project.name}
          </h3>

          {/* Developer */}
          <div className="text-sm font-medium text-muted-foreground truncate">
            {project.developer}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{project.location}</span>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Badge variant={getStatusVariant(project.status)} className="text-[10px] px-2 h-5">
                PL: {project.legalScore}/10
              </Badge>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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