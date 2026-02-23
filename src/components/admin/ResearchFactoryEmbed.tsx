"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, Globe, RefreshCw } from "lucide-react";
import FormattedAnalysisRenderer from "@/components/analysis/FormattedAnalysisRenderer";
import { Project } from "@/types/project";

interface Props {
  project: Project;
  onSuccess?: () => void;
}

export default function ResearchFactoryEmbed({ project, onSuccess }: Props) {
  const [rawContent, setRawContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [researching, setResearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Tự động điền thông tin dự án vào ô nhập liệu khi component load
  useEffect(() => {
    if (project && !rawContent) {
      const autoFillContent = `
THÔNG TIN CƠ BẢN:
- Dự án: ${project.name}
- Chủ đầu tư: ${project.developer}
- Vị trí: ${project.location} (${project.district}, ${project.city})
- Giá tham khảo: ${project.priceRange} (~${(project.pricePerSqm / 1000000).toLocaleString('vi-VN')} tr/m²)
- Tình trạng: ${project.status === 'good' ? 'Pháp lý tốt' : project.status === 'warning' ? 'Cần lưu ý' : 'Rủi ro'}
- Điểm pháp lý: ${project.legalScore}/10
- Tiện ích: ${(project.amenities || []).join(", ")}

YÊU CẦU PHÂN TÍCH:
Hãy tổng hợp thành một báo cáo chuyên sâu, tập trung vào:
1. Đánh giá vị trí và tiềm năng tăng giá.
2. Phân tích mức giá so với khu vực lân cận.
3. Uy tín chủ đầu tư và pháp lý.
4. Nhận định rủi ro và khuyến nghị đầu tư.
      `.trim();
      setRawContent(autoFillContent);
    }
  }, [project]);

  // Hàm gọi AI để tìm kiếm thông tin mới từ Internet (Deep Scan)
  const handleAutoResearch = async () => {
    setResearching(true);
    try {
      toast.info("AI đang quét dữ liệu thị trường (mất khoảng 10-15s)...");
      
      const { data, error } = await supabase.functions.invoke('research-project', {
        body: { 
          query: project.name, 
          mode: 'deep_scan',
          // Gửi kèm context hiện tại để AI biết đã có gì
          context: rawContent 
        }
      });

      if (error) throw error;

      if (data?.data) {
        // Nối kết quả tìm kiếm vào nội dung hiện có
        const newContent = `${rawContent}\n\n=== KẾT QUẢ TÌM KIẾM BỔ SUNG TỪ AI ===\n${data.data}`;
        setRawContent(newContent);
        toast.success("Đã cập nhật thêm thông tin tìm kiếm mới!");
      }
    } catch (error: any) {
      toast.error("Lỗi tìm kiếm: " + error.message);
    } finally {
      setResearching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!rawContent.trim()) {
      toast.error("Nội dung trống");
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('format-project-analysis', {
        body: { raw_content: rawContent }
      });

      if (error) throw error;
      if (data?.formatted) {
        setResult(data.formatted);
        toast.success("Phân tích & Định dạng hoàn tất!");
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
      // Không xóa rawContent để user có thể sửa và tạo lại nếu muốn
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="h-fit border-l-4 border-l-primary flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Bước 1: Dữ liệu phân tích</CardTitle>
              <CardDescription>
                AI đã tự điền thông tin cơ bản. Bạn có thể paste thêm bài báo/tin tức hoặc dùng nút <strong>Auto Research</strong> để tìm thêm.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAutoResearch} 
              disabled={researching || analyzing}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {researching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
              AI Tìm kiếm thêm
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <Textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm leading-relaxed"
            placeholder="Nội dung phân tích sẽ hiện ở đây..."
          />
          <div className="flex gap-2">
             <Button 
              onClick={() => setRawContent("")} 
              variant="ghost" 
              disabled={analyzing}
            >
              Xóa
            </Button>
            <Button 
              onClick={handleAnalyze} 
              disabled={analyzing || !rawContent} 
              className="flex-1"
            >
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Tạo Báo cáo Phân tích
            </Button>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="h-fit border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Bước 2: Kiểm tra kết quả</CardTitle>
            <CardDescription>AI đã cấu trúc lại dữ liệu thành báo cáo chuyên nghiệp.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background max-h-[600px] overflow-y-auto mb-4">
              <FormattedAnalysisRenderer formatted={result} isPremium={true} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" /> Làm lại
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Xuất bản Báo cáo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="hidden lg:flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground p-10">
           <Sparkles className="w-16 h-16 mb-4 opacity-20" />
           <p>Kết quả phân tích sẽ hiển thị tại đây</p>
        </div>
      )}
    </div>
  );
}