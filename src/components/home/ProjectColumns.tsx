import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import CompactProjectCard from "./CompactProjectCard";

interface ProjectColumnsProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
}

const ProjectColumns = ({ projects, onProjectClick }: ProjectColumnsProps) => {
  // Filter projects into 3 categories
  const sellingProjects = projects.filter(p => p.status === "good" || p.status === "warning");
  const upcomingProjects = projects.filter(p => {
    const completionDate = new Date(p.completionDate);
    const now = new Date();
    return completionDate > now;
  });
  const completedProjects = projects.filter(p => {
    const completionDate = new Date(p.completionDate);
    const now = new Date();
    return completionDate <= now;
  });

  const columns = [
    {
      title: "ĐANG BÁN",
      count: sellingProjects.length,
      projects: sellingProjects,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/20"
    },
    {
      title: "SẮP MỞ",
      count: upcomingProjects.length,
      projects: upcomingProjects,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/20"
    },
    {
      title: "ĐÃ BÀN GIAO",
      count: completedProjects.length,
      projects: completedProjects,
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted/10",
      borderClass: "border-muted/20"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {columns.map((column, index) => (
          <div key={index} className="space-y-6">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${column.colorClass}`}>
                {column.title}
              </h2>
              <Badge 
                className={`${column.bgClass} ${column.colorClass} ${column.borderClass} border font-bold`}
              >
                {column.count}
              </Badge>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {column.projects.slice(0, 6).map((project) => (
                <CompactProjectCard
                  key={project.id}
                  project={project}
                  onClick={onProjectClick}
                />
              ))}
              
              {column.projects.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm">Chưa có dự án nào</p>
                </div>
              )}
              
              {column.projects.length > 6 && (
                <div className="text-center pt-4">
                  <button className={`text-sm font-medium ${column.colorClass} hover:underline`}>
                    Xem thêm {column.projects.length - 6} dự án
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectColumns;