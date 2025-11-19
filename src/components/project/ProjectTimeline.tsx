"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Construction,
  Home,
  Key,
  FileCheck
} from "lucide-react";

interface ProjectTimelineProps {
  completionDate: string;
  soldUnits?: number;
  totalUnits?: number;
}

const ProjectTimeline = ({ completionDate, soldUnits, totalUnits }: ProjectTimelineProps) => {
  const isCompleted = completionDate === "Đã hoàn thành";
  
  // Mock timeline data - in real app, this would come from database
  const timelineEvents = [
    {
      id: 1,
      title: "Khởi công xây dựng",
      date: "15/01/2023",
      status: "completed",
      icon: Construction,
      description: "Lễ khởi công và bắt đầu thi công móng"
    },
    {
      id: 2,
      title: "Hoàn thành móng & kết cấu",
      date: "30/06/2023",
      status: "completed",
      icon: CheckCircle,
      description: "Hoàn thành phần móng và kết cấu chính"
    },
    {
      id: 3,
      title: "Hoàn thiện ngoại thất",
      date: "15/12/2023",
      status: isCompleted ? "completed" : "in-progress",
      icon: Home,
      description: "Thi công hoàn thiện mặt ngoài và cảnh quan"
    },
    {
      id: 4,
      title: "Hoàn thiện nội thất",
      date: "30/03/2024",
      status: isCompleted ? "completed" : "in-progress",
      icon: Key,
      description: "Hoàn thiện nội thất các căn hộ"
    },
    {
      id: 5,
      title: "Nghiệm thu & bàn giao",
      date: completionDate === "Đã hoàn thành" ? "15/06/2024" : completionDate,
      status: isCompleted ? "completed" : "upcoming",
      icon: FileCheck,
      description: "Nghiệm thu chất lượng và bàn giao cho khách hàng"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 text-white";
      case "in-progress":
        return "bg-blue-500 text-white";
      case "upcoming":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">Hoàn thành</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">Đang thực hiện</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="text-muted-foreground">Sắp tới</Badge>;
      default:
        return null;
    }
  };

  const completedEvents = timelineEvents.filter(e => e.status === "completed").length;
  const progressPercent = (completedEvents / timelineEvents.length) * 100;

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-card">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-t-2xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Tiến độ xây dựng
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            {progressPercent.toFixed(0)}% hoàn thành
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Tiến độ tổng thể</span>
            <span className="font-bold text-primary">{completedEvents}/{timelineEvents.length} giai đoạn</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Sales Progress */}
        {soldUnits && totalUnits && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Tiến độ bán hàng</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {soldUnits}/{totalUnits} căn
              </span>
            </div>
            <Progress 
              value={(soldUnits / totalUnits) * 100} 
              className="h-2 mb-2 bg-blue-200 dark:bg-blue-900"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round((soldUnits / totalUnits) * 100)}% đã có chủ
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const IconComponent = event.icon;
              const isLast = index === timelineEvents.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${getStatusColor(event.status)} flex items-center justify-center shadow-lg border-2 border-background`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
                    <div className="bg-card hover:bg-accent/50 rounded-xl p-4 shadow-sm border border-border transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{event.date}</span>
                          </div>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {timelineEvents.filter(e => e.status === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Hoàn thành</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {timelineEvents.filter(e => e.status === "in-progress").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Đang thực hiện</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {timelineEvents.filter(e => e.status === "upcoming").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Sắp tới</div>
          </div>
        </div>

        {/* Warning if delayed */}
        {!isCompleted && new Date(completionDate) < new Date() && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Lưu ý về tiến độ</div>
                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                  Dự án có thể đang chậm so với kế hoạch ban đầu. 
                  Vui lòng liên hệ chủ đầu tư để biết thông tin cập nhật chính xác.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion message */}
        {isCompleted && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Dự án đã hoàn thành</div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Dự án đã hoàn thành và đang trong giai đoạn bàn giao cho khách hàng. 
                  Đây là thời điểm tốt để xem xét đầu tư vào các căn hộ còn lại.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;