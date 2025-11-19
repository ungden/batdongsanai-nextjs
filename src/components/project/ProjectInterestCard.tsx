import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InquiryDialog } from './InquiryDialog';
import { MessageSquare, FileText, Bell, CheckCircle2 } from 'lucide-react';

interface ProjectInterestCardProps {
  projectId: string;
  projectName: string;
}

export function ProjectInterestCard({ projectId, projectName }: ProjectInterestCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-card dark:to-blue-950/10 border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <MessageSquare className="w-5 h-5" />
          Quan tâm dự án này?
        </CardTitle>
        <CardDescription className="text-sm">
          Đăng ký để nhận bộ tài liệu đầy đủ và tư vấn chi tiết về <strong>{projectName}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-border/50">
          <div className="flex items-start gap-2.5 text-sm">
            <FileText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <span className="text-foreground/80">Bảng giá & Chính sách bán hàng mới nhất</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <Bell className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-foreground/80">Thông báo lịch mở bán & Ưu đãi độc quyền</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-foreground/80">Phân tích pháp lý & Dòng tiền đầu tư</span>
          </div>
        </div>

        <InquiryDialog 
          projectId={projectId} 
          projectName={projectName}
          trigger={
            <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              Tôi quan tâm & Muốn tư vấn
            </Button>
          } 
        />
        
        <p className="text-[11px] text-muted-foreground text-center">
          Thông tin của bạn được bảo mật tuyệt đối.
        </p>
      </CardContent>
    </Card>
  );
}