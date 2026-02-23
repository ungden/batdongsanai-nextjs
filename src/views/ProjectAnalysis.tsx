"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter , useParams } from 'next/navigation';

import { ArrowLeft, Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DesktopLayout from "@/components/layout/DesktopLayout";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SEOHead from "@/components/seo/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { projectsData } from "@/data/projectsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectAnalysisList, { ProjectReportListItem } from "@/components/project/ProjectAnalysisList";
import ProjectAnalysisViewer from "@/components/project/ProjectAnalysisViewer";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type ReportRow = {
  id: string;
  project_id: string;
  report_type: string;
  title: string;
  content: any;
  is_vip_only: boolean | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const ProjectAnalysis = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const { isAdmin, isVIP } = usePermissions();
  const { user } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiVip, setAiVip] = useState(false);
  const [generating, setGenerating] = useState(false);

  const project = useMemo(() => projectsData.find(p => p.id === id), [id]);

  const loadReports = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('project_reports')
      .select('*')
      .eq('project_id', id as string)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading reports:", error);
      setReports([]);
    } else {
      setReports(data as unknown as ReportRow[]);
      if (!selectedId && data && data.length > 0) {
        setSelectedId((data[0] as any).id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy dự án</h1>
          <Button onClick={() => navigate.push('/projects')}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const selectedReport = reports.find(r => r.id === selectedId) || null;

  const handleGenerateAI = async () => {
    if (!user) {
      toast({ title: "Yêu cầu đăng nhập", description: "Vui lòng đăng nhập để sử dụng tính năng này.", variant: "destructive" });
      return;
    }
    if (!isAdmin) {
      toast({ title: "Không có quyền", description: "Chỉ admin mới được tạo báo cáo AI.", variant: "destructive" });
      return;
    }

    try {
      setGenerating(true);
      const raw = `
DỰ ÁN: ${project.name}
VỊ TRÍ: ${project.location} (${project.district}, ${project.city})
CHỦ ĐẦU TƯ: ${project.developer}
MÔ TẢ: ${project.description || ""}
TIỆN ÍCH: ${(project.amenities || []).join(", ")}
LOẠI CĂN HỘ: ${(project.apartmentTypes || []).join(", ")}
GIÁ MỞ BÁN: ${project.launchPrice ? project.launchPrice.toLocaleString('vi-VN') : "N/A"} đ/m² (${project.launchDate || "?"})
GIÁ HIỆN TẠI: ${project.currentPrice ? project.currentPrice.toLocaleString('vi-VN') : "N/A"} đ/m²
ĐIỂM PHÁP LÝ: ${project.legalScore ?? "N/A"}
TỔNG CĂN: ${project.totalUnits ?? "N/A"}, ĐÃ BÁN: ${project.soldUnits ?? "N/A"}

GHI CHÚ NGHIÊN CỨU BỔ SUNG:
${aiNotes || "(Không)"}      
      `.trim();

      const { data, error } = await supabase.functions.invoke('format-project-analysis', {
        body: { raw_content: raw },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || "Không gọi được AI.");
      }

      const formatted = data.formatted;
      const title = formatted?.meta?.title || `Phân tích dự án ${project.name}`;
      const insertPayload = {
        project_id: id as string,
        report_type: 'ai_research',
        title,
        content: formatted,
        is_vip_only: aiVip,
        author_id: user.id,
        published_at: new Date().toISOString(),
      };

      const { error: insertErr, data: inserted } = await supabase
        .from('project_reports')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertErr) throw insertErr;

      toast({ title: "Đã tạo báo cáo AI", description: "Báo cáo đã được lưu và sẵn sàng hiển thị." });
      setAiOpen(false);
      setAiNotes("");
      setAiVip(false);
      await loadReports();
      if (inserted?.id) setSelectedId(inserted.id);
    } catch (e: any) {
      console.error("AI generate failed:", e);
      toast({ title: "Lỗi tạo báo cáo", description: e?.message || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const listItems: ProjectReportListItem[] = (reports || []).map(r => ({
    id: r.id,
    title: r.title,
    report_type: r.report_type,
    is_vip_only: r.is_vip_only,
    created_at: r.created_at,
    published_at: r.published_at,
  }));

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate.push(`/projects/${id}`)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Phân tích chuyên sâu</h1>
            <p className="text-slate-600">{project.name}</p>
          </div>
        </div>

        {isAdmin && (
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Wand2 className="w-4 h-4 mr-2" />
                Nghiên cứu AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo báo cáo AI cho {project.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Ghi chú / Yêu cầu nghiên cứu (tùy chọn)</label>
                  <Textarea
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                    rows={6}
                    placeholder="Ví dụ: Tập trung vào pháp lý, tiến độ hạ tầng, tỷ suất cho thuê..."
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="vip-only" checked={aiVip} onCheckedChange={(v) => setAiVip(!!v)} />
                  <label htmlFor="vip-only" className="text-sm text-slate-700">Đánh dấu là nội dung VIP</label>
                  {aiVip && <Badge className="ml-2 bg-amber-500">VIP</Badge>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiOpen(false)}>Hủy</Button>
                <Button onClick={handleGenerateAI} disabled={generating}>
                  {generating ? "Đang tạo..." : "Tạo báo cáo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 rounded" />
              <div className="h-12 bg-slate-100 rounded" />
              <div className="h-12 bg-slate-100 rounded" />
            </div>
          ) : (
            <ProjectAnalysisList
              items={listItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>
        <div className="lg:col-span-8">
          {!selectedReport ? (
            <div className="rounded-xl border p-6 text-slate-600">
              Hãy chọn một báo cáo ở danh sách bên trái để xem chi tiết.
            </div>
          ) : (
            <ProjectAnalysisViewer
              content={selectedReport.content}
              isVip={!!selectedReport.is_vip_only}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title={`Phân tích ${project.name} - PropertyHub`}
          description={`Báo cáo phân tích chi tiết dự án ${project.name}.`}
          keywords={`phân tích, báo cáo, ${project.name}, đầu tư bất động sản`}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-20">
          <div className="p-4">
            {content}
          </div>
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`Phân tích ${project.name} - PropertyHub`}
        description={`Báo cáo phân tích chi tiết dự án ${project.name}.`}
        keywords={`phân tích, báo cáo, ${project.name}, đầu tư bất động sản`}
      />
      <DesktopLayout title="Phân tích dự án" subtitle={project.name}>
        {content}
      </DesktopLayout>
    </>
  );
};

export default ProjectAnalysis;