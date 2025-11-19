"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, FileText } from "lucide-react";
import FormattedAnalysisRenderer from "@/components/analysis/FormattedAnalysisRenderer";
import { Project } from "@/types/project";

interface Props {
  project: Project;
  onSuccess?: () => void;
}

export default function ResearchFactoryEmbed({ project, onSuccess }: Props) {
  const [rawContent, setRawContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!rawContent.trim()) {
      toast.error("Vui lòng nhập nội dung thô");
      return;
    }

    setAnalyzing(true);
    try {
      const context = `
DỰ ÁN: ${project.name}
VỊ TRÍ: ${project.location}
CHỦ ĐẦU TƯ: ${project.developer}
GIÁ: ${project.priceRange}

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
      toast.error("Lỗi phân tích: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from('project_reports').insert({
        project_id: project.id,
        title: result.meta?.title || `Phân tích ${project.name}`,
        report_type: 'ai_research',
        content: result,
        is_vip_only: true,
        published_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success("Đã lưu báo cáo vào hồ sơ dự án");
      setResult(null);
      setRawContent("");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="h-fit border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Bước 1: Nhập dữ liệu thô</CardTitle>
          <CardDescription>Paste thông tin brochure, bài báo, hoặc ghi chú về <strong>{project.name}</strong></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Ví dụ: Dự án có quy mô 5ha, mật độ xây dựng 30%, tiện ích hồ bơi vô cực..."
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing || !rawContent} 
            className="w-full"
          >
            {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            AI Phân tích & Trích xuất
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="h-fit border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Bước 2: Kiểm tra kết quả</CardTitle>
            <CardDescription>AI đã cấu trúc lại dữ liệu. Hãy kiểm tra trước khi lưu.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background max-h-[500px] overflow-y-auto mb-4">
              <FormattedAnalysisRenderer formatted={result} isPremium={true} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu vào Hồ sơ dự án
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}