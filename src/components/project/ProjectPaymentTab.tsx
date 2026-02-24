"use client";

import { useState } from "react";
import PaymentCalculator from "@/components/calculator/PaymentCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectPaymentTabProps {
  project: Project;
}

const ProjectPaymentTab = ({ project }: ProjectPaymentTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header with financial overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Tài chính dự án
              </h2>
              <p className="text-muted-foreground">
                <span className="font-semibold">{project.name}</span> - Kế hoạch đầu tư thông minh
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{project.priceRange}</div>
              <div className="text-sm text-muted-foreground">Giá bán</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentCalculator projectPrice={project.priceRange} />
    </div>
  );
};

export default ProjectPaymentTab;