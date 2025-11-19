import { Project } from "@/types/project";

export type ProjectPhase = "upcoming" | "selling" | "handover" | "secondary";

export const getProjectPhase = (project: Project): { phase: ProjectPhase; label: string; color: string } => {
  const now = new Date();
  
  // 1. Sắp mở bán: Ngày launch trong tương lai
  if (project.launchDate && new Date(project.launchDate) > now) {
    return { 
      phase: "upcoming", 
      label: "Sắp mở bán", 
      color: "bg-blue-500 text-white" // Blue for anticipation
    };
  }

  // 2. Thứ cấp: Đã bán > 95% HOẶC Đã bàn giao
  const isSoldOut = project.totalUnits && project.soldUnits 
    ? (project.soldUnits / project.totalUnits) > 0.95 
    : false;
  
  const isCompleted = project.completionDate === "Đã hoàn thành" || 
    (project.completionDate.match(/\d{4}/) && parseInt(project.completionDate.match(/\d{4}/)![0]) < now.getFullYear());

  if (isCompleted || isSoldOut) {
    return { 
      phase: "secondary", 
      label: "Thứ cấp / Chuyển nhượng", 
      color: "bg-purple-600 text-white" // Purple for secondary market
    };
  }

  // 3. Bàn giao: Đang trong giai đoạn bàn giao (ví dụ năm nay)
  if (project.completionDate.includes(now.getFullYear().toString())) {
    return { 
      phase: "handover", 
      label: "Đang bàn giao", 
      color: "bg-emerald-600 text-white" // Green for completion
    };
  }

  // 4. Đang mở bán (Mặc định)
  return { 
    phase: "selling", 
    label: "Đang mở bán", 
    color: "bg-amber-500 text-white" // Amber for active selling
  };
};

export const getPriceTrendColor = (trend: "up" | "down" | "stable" | null) => {
  switch (trend) {
    case "up": return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100";
    case "down": return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100";
    default: return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200";
  }
};