import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";

interface ProjectTabsProps {
  projects: Project[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProjectTabs = ({ projects, activeTab, onTabChange }: ProjectTabsProps) => {
  const allCount = projects.length;
  const sellingCount = projects.filter(p => p.status === "good" || p.status === "warning").length;
  const upcomingCount = projects.filter(p => {
    const completionDate = new Date(p.completionDate);
    const now = new Date();
    return completionDate > now;
  }).length;
  const completedCount = projects.filter(p => {
    const completionDate = new Date(p.completionDate);
    const now = new Date();
    return completionDate <= now;
  }).length;

  const tabs = [
    { id: "all", label: "TẤT CẢ", count: allCount, color: "bg-status-completed" },
    { id: "selling", label: "ĐANG BÁN", count: sellingCount, color: "bg-status-active" },
    { id: "upcoming", label: "SẮP MỞ", count: upcomingCount, color: "bg-status-upcoming" },
    { id: "completed", label: "ĐÃ BÀNG GIAO", count: completedCount, color: "bg-status-completed" }
  ];

  return (
    <nav className="bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 text-base font-medium transition-all rounded-lg ${
                activeTab === tab.id
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{tab.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`min-w-[2.5rem] h-7 px-3 text-sm font-bold rounded-full ${
                    activeTab === tab.id 
                      ? `bg-primary text-primary-foreground` 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ProjectTabs;