"use client";

import FormattedAnalysisRenderer from "@/components/analysis/FormattedAnalysisRenderer";
import { Card } from "@/components/ui/card";
import { FormattedAnalysis } from "@/types/analysis";

interface ProjectAnalysisViewerProps {
  content: any;
  isVip?: boolean;
}

const ProjectAnalysisViewer = ({ content, isVip }: ProjectAnalysisViewerProps) => {
  const formatted = content as FormattedAnalysis | null;

  if (!formatted || !formatted.sections) {
    return (
      <Card className="p-6">
        <p className="text-slate-600">Báo cáo chưa có nội dung định dạng hoặc không đúng cấu trúc.</p>
      </Card>
    );
  }

  return (
    <div>
      <FormattedAnalysisRenderer formatted={formatted} isPremium={!!isVip} />
    </div>
  );
};

export default ProjectAnalysisViewer;