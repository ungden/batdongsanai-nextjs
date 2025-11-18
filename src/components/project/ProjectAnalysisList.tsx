"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface ProjectReportListItem {
  id: string;
  title: string;
  report_type: string;
  is_vip_only?: boolean | null;
  created_at?: string;
  published_at?: string | null;
}

interface ProjectAnalysisListProps {
  items: ProjectReportListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

const ProjectAnalysisList = ({ items, selectedId, onSelect }: ProjectAnalysisListProps) => {
  if (!items || items.length === 0) {
    return (
      <Card className="p-4 text-sm text-slate-600">
        Chưa có báo cáo phân tích nào cho dự án này.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => {
        const isActive = it.id === selectedId;
        const time = it.published_at || it.created_at;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={`w-full text-left rounded-xl p-4 border transition-colors ${
              isActive ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{it.title || "Báo cáo phân tích"}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {it.report_type} • {time ? new Date(time).toLocaleString("vi-VN") : "Chưa công bố"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {it.is_vip_only ? (
                  <Badge className="bg-amber-500">VIP</Badge>
                ) : (
                  <Badge variant="secondary">Public</Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProjectAnalysisList;