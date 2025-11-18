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

  const formatPrice = (price: string) => {
    return price.replace("tỷ", "T").replace("triệu", "M");
  };

  const getSoldPercentage = () => {
    if (!project.totalUnits || !project.soldUnits) return null;
    return Math.round((project.soldUnits / project.totalUnits) * 100);
  };

  const isUpcoming = new Date(project.completionDate) > new Date();
  const soldPercentage = getSoldPercentage();

  return (
    <Card 
      className="card-elevated cursor-pointer group overflow-hidden hover:shadow-xl transition-all duration-300 border-0"
      onClick={() => onClick(project.id)}
    >
      <CardContent className="p-0">
        {/* Image Section with Gradient Overlay */}
        <div className="relative h-[160px] w-full overflow-hidden rounded-t-xl">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-60" />
          
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/30 to-transparent rounded-bl-full" />
          
          {/* Green Sold Badge with glow */}
          {soldPercentage && (
            <div className="absolute top-3 left-3">
              <div className="relative">
                <div className="absolute inset-0 bg-success/50 blur-md rounded-full" />
                <div className="relative bg-gradient-to-r from-success to-success/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-success/30">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {soldPercentage}% đã bán
                </div>
              </div>
            </div>
          )}

          {/* Warning Badge */}
          {project.warnings && project.warnings.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/50 blur-md rounded-full" />
                <div className="relative bg-gradient-to-r from-destructive to-destructive/90 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-destructive/30">
                  {project.warnings.length}
                </div>
              </div>
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-30">
            <FavoriteButton projectId={project.id} projectName={project.name} />
          </div>
          
          {isUpcoming && (
            <div className="absolute top-3 right-12 z-30">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/50 blur-md rounded-full" />
                <Badge className="relative text-xs font-semibold shadow-lg px-2.5 py-1 bg-gradient-to-r from-accent to-accent/90 text-white border border-accent/30">
                  SẮP MỞ BÁN
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Content with gradient background */}
        <div className="relative p-4 space-y-3 bg-gradient-to-br from-card via-card to-muted/20">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          
          {/* Title */}
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {project.name}
          </h3>

          {/* Developer with accent */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full" />
            <div className="text-sm font-medium text-primary/90 truncate">
              {project.developer}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1 bg-primary/10 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium truncate">{project.location}</span>
          </div>

          {/* Price Section with gradient background */}
          <div className="space-y-1.5 py-2.5 px-3 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {project.priceRange}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {(project.pricePerSqm / 1000000).toFixed(1)} triệu VNĐ/m²
            </div>
          </div>

          {/* Bottom Row with colored background */}
          <div className="flex items-center justify-between pt-2 px-2 py-1.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(project.status)} className="px-2.5 py-1 font-bold text-xs shadow-sm">
                PL: {project.legalScore}/10
              </Badge>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="p-0.5 bg-primary/10 rounded">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium">
                {project.completionDate.length > 12 ? project.completionDate.substring(0, 10) + '...' : project.completionDate}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;