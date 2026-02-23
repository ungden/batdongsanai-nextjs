"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { FileText, Crown } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import VIPBadge from "@/components/vip/VIPBadge";

interface AnalysisButtonProps {
  projectId: string;
  className?: string;
}

const AnalysisButton = ({ projectId, className }: AnalysisButtonProps) => {
  const navigate = useRouter();
  const { isVIP } = usePermissions();

  return (
    <Button
      onClick={() => navigate.push(`/projects/${projectId}/analysis`)}
      className={`rounded-xl shadow-lg hover:shadow-xl transition-all ${className}`}
      variant={isVIP ? "default" : "outline"}
    >
      <FileText className="w-4 h-4 mr-2" />
      Xem báo cáo phân tích
      {!isVIP && <Crown className="w-4 h-4 ml-2 text-amber-500" />}
    </Button>
  );
};

export default AnalysisButton;