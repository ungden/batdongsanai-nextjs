"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectsData } from "@/data/projectsData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, FileText } from "lucide-react";
import FormattedAnalysisRenderer from "@/components/analysis/FormattedAnalysisRenderer";

export default function ResearchFactory() {
  const [projectId, setProjectId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const project = projectsData.find(p => p.id === projectId);

  const handleAnalyze = async () => {
    if (!projectId || !rawContent.trim()) {
      toast.error("Vui lòng chọn dự án và nhập nội dung thô");
      return;
    }

    setAnalyzing(true);
    try {
      // Construct a rich context for AI
      const context = `
DỰ ÁN: ${project?.name}
VỊ TRÍ: ${project?.location}
CHỦ ĐẦU TƯ: ${project?.developer}
GIÁ: ${project?.priceRange}
MÔ TẢ: ${project?.description}
TIỆN ÍCH: ${project?.amenities?.join(", ")}

THÔNG TIN THU THẬP THÊM:
${rawContent}
      `.trim();

      const { data, error } = await supabase.functions.invoke('format-project-analysis', {
        body: { raw_content: context }
      });

      if (error) throw error;
      if (data?.formatted) {
        setResult(data.formatted);
        toast.success("Phân tích hoàn tất!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi phân tích: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !projectId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from('project_reports').insert({
        project_id: projectId,
        title: result.meta?.title || `Phân tích ${project?.name}`,
        report_type: 'ai_research',
        content: result,
        is_vip_only: true,
        published_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success("Đã lưu báo cáo vào hệ thống");
      setResult(null);
      setRawContent("");
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Research Factory
          </h1>
          <p className="text-muted-foreground">AI Engine phân tích sâu về dự án bất động sản</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>Nhập dữ liệu thô, ghi chú hoặc bài viết để AI xử lý</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chọn dự án mục tiêu</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dự án..." />
                </SelectTrigger>
                <SelectContent>
                  {projectsData.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dữ liệu thô / Ghi chú nghiên cứu</Label>
              <Textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Paste bài báo, thông tin thị trường, hoặc ghi chú điều tra về dự án tại đây..."
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={analyzing || !projectId} 
              className="w-full"
              size="lg"
            >
              {analyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang phân tích...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Phân tích & Định dạng</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Kết quả phân tích</CardTitle>
            <CardDescription>Preview báo cáo trước khi xuất bản</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-background max-h-[600px] overflow-y-auto">
                  <FormattedAnalysisRenderer formatted={result} isPremium={true} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setResult(null)} variant="outline" className="flex-1">
                    Hủy bỏ
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Lưu báo cáo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Chưa có kết quả phân tích</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}