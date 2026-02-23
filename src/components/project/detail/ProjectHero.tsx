import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, MapPin, Building2, Shield, CheckCircle, 
  Calendar, Briefcase, DollarSign, Home, Star, Share2
} from "lucide-react";

import { SocialShare } from "@/components/SocialShare";
import { PriceAlertDialog } from "@/components/PriceAlertDialog";
import { AppointmentBookingDialog } from "@/components/AppointmentBookingDialog";
import { AddToPortfolioDialog } from "@/components/AddToPortfolioDialog";
import FavoriteButton from "@/components/project/FavoriteButton";
import { Project } from "@/types/project";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProjectHeroProps {
  project: Project;
}

export const ProjectHero = ({ project }: ProjectHeroProps) => {
  const navigate = useRouter();

  return (
    <div className="bg-card border-b border-border shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb / Back */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate.push('/projects')}
            className="text-muted-foreground hover:text-foreground -ml-2 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <div className="flex gap-2">
            <SocialShare url={window.location.href} title={project.name} variant="ghost" size="sm" />
            <FavoriteButton projectId={project.id} projectName={project.name} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2">
              {project.status === 'good' && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 border-0">
                  <Shield className="w-3 h-3 mr-1" /> Pháp lý an toàn
                </Badge>
              )}
              {project.completionDate === "Đã hoàn thành" && (
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" /> Đã bàn giao
                </Badge>
              )}
              <Badge variant="outline" className="border-border text-muted-foreground">{project.district}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
              {project.name}
            </h1>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 opacity-70" />
                {project.location}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 opacity-70" />
                <span 
                  className="font-medium text-primary cursor-pointer hover:underline"
                  onClick={() => navigate.push(`/developers/${project.developer.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  {project.developer}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions / Price Box */}
          <div className="lg:col-span-1">
            <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border/50 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Giá tham khảo</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary tracking-tight">{project.priceRange}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ~{formatCurrency(project.pricePerSqm)} / m²
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <AppointmentBookingDialog
                  projectId={project.id}
                  projectName={project.name}
                  triggerButton={
                    <Button className="w-full font-semibold shadow-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch xem
                    </Button>
                  }
                />
                <PriceAlertDialog
                  projectId={project.id}
                  projectName={project.name}
                  currentPrice={project.pricePerSqm}
                />
              </div>
              
              <AddToPortfolioDialog
                projectId={project.id}
                projectName={project.name}
                currentPrice={project.pricePerSqm}
                triggerButton={
                  <Button variant="outline" className="w-full border-border bg-background hover:bg-accent text-foreground">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Thêm vào Portfolio
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};