"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wand2, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DesktopLayout from "@/components/layout/DesktopLayout";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SEOHead from "@/components/seo/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { projectsData } from "@/data/projectsData";
import { supabase } from "@/integrations/supabase/client";
import ProjectAnalysisList, { ProjectReportListItem } from "@/components/project/ProjectAnalysisList";
import ProjectAnalysisViewer from "@/components/project/ProjectAnalysisViewer";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { FormattedAnalysis } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormattedAnalysisRenderer from "@/components/analysis/FormattedAnalysisRenderer";
import ProjectReportCard from "@/components/project/ProjectReportCard";
import { useDebounce } from "@/hooks/useDebounce";
import AiImproveButtonProject from "@/components/admin/AiImproveButtonProject";

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

type ReportFeedItem = {
  id: string;
  project_id: string;
  title: string;
  is_vip_only: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const ProjectAnalysisHub = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const { toast } = useToast();

  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const project = useMemo(() => projectsData.find(p => p.id === projectId), [projectId]);

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiVip, setAiVip] = useState(false);
  const [generating, setGenerating] = useState(false);

  // NEW: Trạng thái cho AI Studio (Admin)
  const [rawText, setRawText] = useState("");
  const [formattedPreview, setFormattedPreview] = useState<FormattedAnalysis | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [savingPreview, setSavingPreview] = useState(false);
  const [previewVip, setPreviewVip] = useState(false);

  // NEW: State cho danh sách tổng hợp kiểu titanlabs1
  const [feed, setFeed] = useState<ReportFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Tìm kiếm và lọc/sắp xếp
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [premiumFilter, setPremiumFilter] = useState<"all" | "free" | "vip">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const PAGE_SIZE = 10;

  const fetchFeed = async (currentOffset = 0, reset = false) => {
    if (reset) setFeedLoading(true);
    else setLoadingMore(true);

    const { data, error } = await supabase
      .from("project_reports")
      .select("id, project_id, title, is_vip_only, published_at, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error loading project reports:", error);
      if (reset) setFeed([]);
      else setFeed((prev) => prev);
    } else {
      if (reset) {
        setFeed((data || []) as ReportFeedItem[]);
      } else {
        setFeed((prev) => [...prev, ...((data || []) as ReportFeedItem[])]);
      }
      const added = (data || []).length;
      setOffset(currentOffset + added);
      setHasMore(added === PAGE_SIZE);
    }

    if (reset) setFeedLoading(false);
    else setLoadingMore(false);
  };

  useEffect(() => {
    // Tải lần đầu danh sách tổng hợp
    fetchFeed(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listItems: ProjectReportListItem[] = (reports || []).map(r => ({
    id: r.id,
    title: r.title,
    report_type: r.report_type,
    is_vip_only: r.is_vip_only,
    created_at: r.created_at,
    published_at: r.published_at,
  }));

  const selectedReport = reports.find(r => r.id === selectedId) || null;

  const handleGenerateAI = async () => {
    if (!projectId || !project) {
      toast({ title: "Chưa chọn dự án", description: "Hãy chọn một dự án trước.", variant: "destructive" });
      return;
    }
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
        project_id: projectId,
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

      const { data: reData } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      setReports((reData || []) as unknown as ReportRow[]);
      if (inserted?.id) setSelectedId(inserted.id);
    } catch (e: any) {
      console.error("AI generate failed:", e);
      toast({ title: "Lỗi tạo báo cáo", description: e?.message || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // NEW: Định dạng xem trước bằng AI (không lưu ngay)
  const handleFormatPreview = async () => {
    if (!projectId || !project) {
      toast({ title: "Chưa chọn dự án", description: "Hãy chọn một dự án trước.", variant: "destructive" });
      return;
    }
    if (!rawText.trim()) {
      toast({ title: "Thiếu nội dung", description: "Nhập ghi chú/nội dung thô để AI định dạng.", variant: "destructive" });
      return;
    }
    setIsFormatting(true);
    try {
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

GHI CHÚ / NỘI DUNG THÔ:
${rawText.trim()}
      `.trim();

      const { data, error } = await supabase.functions.invoke('format-project-analysis', {
        body: { raw_content: raw },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || "Không gọi được AI.");
      }

      setFormattedPreview(data.formatted as FormattedAnalysis);
      toast({ title: "Đã định dạng", description: "Xem trước kết quả bên dưới." });
    } catch (e: any) {
      toast({ title: "Lỗi định dạng", description: e?.message || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsFormatting(false);
    }
  };

  // NEW: Lưu nội dung xem trước vào project_reports
  const handleSavePreview = async () => {
    if (!projectId || !project) {
      toast({ title: "Chưa chọn dự án", description: "Hãy chọn một dự án trước.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Yêu cầu đăng nhập", description: "Vui lòng đăng nhập để lưu báo cáo.", variant: "destructive" });
      return;
    }
    if (!formattedPreview) {
      toast({ title: "Chưa có nội dung", description: "Hãy định dạng AI trước khi lưu.", variant: "destructive" });
      return;
    }
    setSavingPreview(true);
    try {
      const title = formattedPreview.meta?.title || `Phân tích dự án ${project.name}`;
      const insertPayload = {
        project_id: projectId,
        report_type: 'ai_research',
        title,
        content: formattedPreview,
        is_vip_only: previewVip,
        author_id: user.id,
        published_at: new Date().toISOString(),
      };

      const { error: insertErr, data: inserted } = await supabase
        .from('project_reports')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertErr) throw insertErr;

      toast({ title: "Đã lưu báo cáo", description: "Báo cáo đã được lưu và hiển thị trong danh sách." });
      setFormattedPreview(null);
      setRawText("");
      setPreviewVip(false);

      // Refresh danh sách và chọn bản mới
      const { data: reData } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      setReports((reData || []) as any);
      if (inserted?.id) setSelectedId(inserted.id);
    } catch (e: any) {
      toast({ title: "Lỗi lưu báo cáo", description: e?.message || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setSavingPreview(false);
    }
  };

  // Lọc và sắp xếp (client-side) giống titanlabs1
  const filteredFeed = useMemo(() => {
    let list = [...feed];

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter((r) => {
        const p = projectsData.find((x) => x.id === r.project_id);
        const projectName = p?.name?.toLowerCase() || "";
        const t = r.title?.toLowerCase?.() || "";
        return t.includes(q) || projectName.includes(q);
      });
    }

    if (premiumFilter !== "all") {
      list = list.filter((r) => (premiumFilter === "vip" ? r.is_vip_only : !r.is_vip_only));
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          const da = a.published_at || a.created_at;
          const db = b.published_at || b.created_at;
          return new Date(db || 0).getTime() - new Date(da || 0).getTime();
        }
        case "oldest": {
          const da2 = a.published_at || a.created_at;
          const db2 = b.published_at || b.created_at;
          return new Date(da2 || 0).getTime() - new Date(db2 || 0).getTime();
        }
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return list;
  }, [feed, debouncedSearchQuery, premiumFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() || premiumFilter !== "all" || sortBy !== "newest";

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchFeed(offset, false);
  };

  useEffect(() => {
    if (!projectId) {
      setReports([]);
      setSelectedId(null);
      return;
    }
    const loadReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading reports:", error);
        setReports([]);
      } else {
        setReports(data as unknown as ReportRow[]);
        if (data && data.length > 0) setSelectedId((data[0] as any).id);
      }
      setLoading(false);
    };
    loadReports();
  }, [projectId]);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => history.back()}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phân tích dự án</h1>
          <p className="text-slate-600">Danh sách báo cáo phân tích dự án trên PropertyHub</p>
        </div>
      </div>

      {isAdmin && (
        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl" disabled={!projectId}>
              <Wand2 className="w-4 h-4 mr-2" />
              Nghiên cứu AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tạo báo cáo AI {project ? `cho ${project.name}` : ""}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Ghi chú / Yêu cầu nghiên cứu (tùy chọn)</Label>
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
                <Label htmlFor="vip-only" className="text-sm text-slate-700">Đánh dấu là nội dung VIP</Label>
                {aiVip && <Badge className="ml-2 bg-amber-500">VIP</Badge>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAiOpen(false)}>Hủy</Button>
              <Button onClick={handleGenerateAI} disabled={generating || !projectId}>
                {generating ? "Đang tạo..." : "Tạo báo cáo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  const body = (
    <div className="space-y-6">
      {/* AI Studio (Admin) đặt trên cùng, có chọn dự án nội bộ */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Studio (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <Label className="text-sm font-medium text-slate-700">Chọn dự án</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn một dự án..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsData.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border p-4">
                <Label className="text-sm font-medium text-slate-700">Tùy chọn</Label>
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="preview-vip"
                    checked={previewVip}
                    onCheckedChange={(v) => setPreviewVip(!!v)}
                  />
                  <Label htmlFor="preview-vip" className="text-sm text-slate-700">
                    Đánh dấu là nội dung VIP
                  </Label>
                  {previewVip && <Badge className="ml-2 bg-amber-500">VIP</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Ghi chú / Nội dung thô để AI định dạng
              </Label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Dán nội dung phân tích, ghi chú nghiên cứu... (AI sẽ kết hợp thêm metadata dự án để định dạng chuẩn JSON)"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRawText("");
                  setFormattedPreview(null);
                  setPreviewVip(false);
                }}
              >
                Làm mới
              </Button>
              <Button onClick={handleFormatPreview} disabled={isFormatting || !rawText.trim() || !projectId}>
                {isFormatting ? "Đang định dạng..." : "Định dạng JSON (AI)"}
              </Button>
              <Button onClick={handleSavePreview} disabled={savingPreview || !formattedPreview || !projectId}>
                {savingPreview ? "Đang lưu..." : "Lưu báo cáo"}
              </Button>
            </div>

            {formattedPreview && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Xem trước kết quả</Label>
                <div className="border rounded-lg p-4 bg-white max-h-[60vh] overflow-y-auto">
                  <FormattedAnalysisRenderer formatted={formattedPreview} isPremium={previewVip} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <AiImproveButtonProject
                    mode="structured"
                    section="project_analysis"
                    payload={formattedPreview}
                    label="AI cải thiện nội dung"
                    size="sm"
                    onResult={(improved) => {
                      // Giữ nguyên kiểu FormattedAnalysis
                      setFormattedPreview(improved as any);
                    }}
                  />
                  <Button onClick={handleSavePreview} disabled={savingPreview || !formattedPreview}>
                    {savingPreview ? "Đang lưu..." : "Lưu báo cáo"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Khu vực tìm kiếm + lọc + sắp xếp giống titanlabs1 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm theo tiêu đề hoặc tên dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Lọc:</span>
            </div>

            <Select value={premiumFilter} onValueChange={(v) => setPremiumFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loại nội dung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="free">Miễn phí</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="title">Theo tên</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setPremiumFilter("all"); setSortBy("newest"); }}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {(searchQuery.trim() || hasActiveFilters) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {filteredFeed.length} kết quả
                </Badge>
                {searchQuery.trim() && (
                  <span className="text-sm text-gray-600">
                    cho "<strong>{searchQuery}</strong>"
                  </span>
                )}
              </div>
              {filteredFeed.length === 0 && (
                <span className="text-sm text-gray-500">
                  Thử thay đổi từ khóa hoặc bộ lọc
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Danh sách kết quả */}
      <div className="space-y-6">
        {feedLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-slate-100 rounded" />
            <div className="h-24 bg-slate-100 rounded" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery.trim() || hasActiveFilters ? "Không tìm thấy kết quả" : "Chưa có báo cáo phân tích nào"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery.trim() || hasActiveFilters
                ? "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc"
                : "Các báo cáo phân tích sẽ được cập nhật sớm"
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setPremiumFilter("all"); setSortBy("newest"); }}>
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        ) : (
          filteredFeed.map((r) => (
            <ProjectReportCard
              key={r.id}
              id={r.id}
              title={r.title}
              isVip={!!r.is_vip_only}
              projectId={r.project_id}
              publishedAt={r.published_at}
              createdAt={r.created_at}
            />
          ))
        )}
      </div>

      {hasMore && !hasActiveFilters && (
        <div className="text-center py-6">
          <Button onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="Phân tích dự án (AI) - PropertyHub"
          description="Chọn dự án để xem các báo cáo nghiên cứu 360° do AI tạo."
          keywords="phân tích dự án, AI, báo cáo bất động sản"
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-20">
          <div className="p-4 space-y-6">
            {header}
            {body}
          </div>
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Phân tích dự án (AI) - PropertyHub"
        description="Chọn dự án để xem các báo cáo nghiên cứu 360° do AI tạo."
        keywords="phân tích dự án, AI, báo cáo bất động sản"
      />
      <DesktopLayout title="Phân tích dự án" subtitle="Nghiên cứu AI 360° theo từng dự án">
        <div className="space-y-6">
          {header}
          {body}
        </div>
      </DesktopLayout>
    </>
  );
};

export default ProjectAnalysisHub;