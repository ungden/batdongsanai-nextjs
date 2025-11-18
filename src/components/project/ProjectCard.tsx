
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MapPin, User, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import FavoriteButton from "./FavoriteButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
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

  return (
    <Card 
      className="card-elevated cursor-pointer overflow-hidden group relative hover:shadow-strong transition-all duration-300"
      onClick={() => onClick(project.id)}
    >
      <div className="flex gap-6 p-6">
        {/* Professional Image */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover rounded-xl shadow-medium transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 rounded-xl" />
          
          {/* Warning indicator */}
          {project.warnings.length > 0 && (
            <div className="absolute -top-2 -right-2 z-20">
              <Badge variant="destructive" className="text-xs px-2 py-1 shadow-medium">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {project.warnings.length}
              </Badge>
            </div>
          )}
          
          {/* Professional accent */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-primary rounded-full shadow-glow opacity-80 group-hover:scale-125 transition-all duration-300" />
        </div>
        
        {/* Scientific Content Layout */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header with title and favorite */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-lg line-clamp-2 leading-relaxed text-foreground group-hover:text-primary transition-colors duration-300">
                {project.name}
              </h3>
              <StatusBadge variant={getStatusVariant(project.status)} className="text-xs px-3 py-1.5 font-bold shadow-subtle">
                {getStatusText(project.status)}
              </StatusBadge>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="flex gap-2">
              <AddToCompareButton
                project={project}
                variant="ghost"
                size="icon"
                showText={false}
              />
              <FavoriteButton projectId={project.id} projectName={project.name} />
            </div>
          </div>
          
          {/* Location and Developer */}
          <div className="space-y-3">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
              <span className="line-clamp-1 font-medium">{project.location}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <User className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
              <span 
                className="line-clamp-1 hover:text-primary cursor-pointer font-medium transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  const developerId = project.developer.toLowerCase().replace(/\s+/g, '-');
                  window.location.href = `/developers/${developerId}`;
                }}
              >
                {project.developer}
              </span>
            </div>
          </div>
          
          {/* Price and Legal Score Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="font-bold text-lg text-primary bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                {project.priceRange}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatPrice(project.pricePerSqm)} VNĐ/m²
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <Badge variant="outline" className="text-sm font-bold px-3 py-2 border-primary/30 text-primary shadow-subtle">
                {project.legalScore}/10
              </Badge>
              <div className="text-xs text-muted-foreground font-medium">{project.completionDate}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
