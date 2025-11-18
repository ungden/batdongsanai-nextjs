import { Project } from "@/types/project";

export type ProjectBadge = "hot" | "new" | "featured" | "discount";

export const getProjectBadges = (project: Project): ProjectBadge[] => {
  if (project.badges && project.badges.length) return project.badges as ProjectBadge[];
  const badges: ProjectBadge[] = [];
  try {
    if (project.launchDate) {
      const launch = new Date(project.launchDate);
      const now = new Date();
      const diffDays = (now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 120) badges.push("new");
    }

    let trend: "up" | "down" | "stable" | null = null;
    if (project.priceHistory && project.priceHistory.length >= 2) {
      const latest = project.priceHistory[project.priceHistory.length - 1].price;
      const prev = project.priceHistory[project.priceHistory.length - 2].price;
      trend = latest > prev ? "up" : latest < prev ? "down" : "stable";
    }

    const soldPct = project.totalUnits && project.soldUnits ? (project.soldUnits / project.totalUnits) * 100 : undefined;

    if (trend === "up" || (project.legalScore >= 8 && (soldPct ?? 0) >= 50)) {
      badges.push("hot");
    }

    if (trend === "down") {
      badges.push("discount");
    }

    if (project.legalScore >= 9 || (soldPct ?? 0) >= 80) {
      badges.push("featured");
    }
  } catch {}
  return badges;
};

export const badgeVariantFor = (b: ProjectBadge): "premium" | "secondary" | "warning" | "default" => {
  switch (b) {
    case "hot":
      return "premium";
    case "new":
      return "secondary";
    case "discount":
      return "warning";
    default:
      return "default";
  }
};

export const badgeLabelFor = (b: ProjectBadge): string => {
  switch (b) {
    case "hot":
      return "Hot";
    case "new":
      return "Mới";
    case "discount":
      return "Giảm giá";
    case "featured":
      return "Nổi bật";
    default:
      return b;
  }
};
