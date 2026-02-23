"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { projectsData } from "@/data/projectsData";

export interface ProjectReportCardProps {
  id: string;
  title: string;
  isVip?: boolean;
  projectId: string;
  publishedAt?: string | null;
  createdAt?: string;
}

const ProjectReportCard = ({
  id,
  title,
  isVip,
  projectId,
  publishedAt,
  createdAt,
}: ProjectReportCardProps) => {
  const project = projectsData.find((p) => p.id === projectId);
  const projectName = project ? project.name : `Dự án ${projectId}`;
  const time = publishedAt || createdAt;

  const handleView = () => {
    // Điều hướng tới trang phân tích theo dự án để xem chi tiết
    window.location.assign(`/projects/${projectId}/analysis`);
  };

  return (
    <Card className="p-5 hover:shadow-md transition rounded-xl border">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900">{title || "Báo cáo phân tích"}</h3>
            {isVip ? (
              <Badge className="bg-amber-500">VIP</Badge>
            ) : (
              <Badge variant="secondary">Public</Badge>
            )}
          </div>
          <div className="text-sm text-slate-600">
            {projectName} • {time ? new Date(time).toLocaleString("vi-VN") : "Chưa công bố"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleView}>Xem chi tiết</Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectReportCard;