"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Save } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Project } from "@/types/project";

interface Props {
  project: Project;
  onSuccess?: () => void;
}

export default function ContentStudioEmbed({ project, onSuccess }: Props) {
  const [contentType, setContentType] = useState("news");
  const [topic, setTopic] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error("Vui lòng nhập chủ đề");
      return;
    }

    setGenerating(true);
    try {
      const projectContext = `
DỰ ÁN: ${project.name}
VỊ TRÍ: ${project.location} (${project.district})
CHỦ ĐẦU TƯ: ${project.developer}
GIÁ: ${project.priceRange}
      `.trim();

      // Ghép thêm instructions vào context
      const fullContext = customInstructions 
        ? `${projectContext}\n\nLƯU Ý ĐẶC BIỆT CỦA NGƯỜI DÙNG: ${customInstructions}`
        : projectContext;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'generate',
          topic: topic,
          type: contentType,
          context: fullContext,
          tone: "chuyên nghiệp",
          language: 'vi-VN'
        }
      });

      if (error) throw error;
      setResult(data.data);
      toast.success("Đã tạo nội dung!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const { error } = await supabase.from('content_items').insert({
        title: result.title,
        content: result.content,
        type: 'news',
        status: 'draft', // Luôn lưu nháp để duyệt sau
        meta_title: result.meta_title,
        meta_description: result.summary,
      });

      if (error) throw error;
      toast.success("Đã lưu vào hàng đợi duyệt!");
      if (onSuccess) onSuccess();
      setResult(null);
      setTopic("");
      setCustomInstructions("");
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Cấu hình bài viết</CardTitle>
          <CardDescription>AI sẽ viết bài dựa trên thông tin dự án <strong>{project.name}</strong></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Loại nội dung</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="news">Tin tức / Sự kiện</SelectItem>
                <SelectItem value="blog">Bài viết Blog / SEO</SelectItem>
                <SelectItem value="pr">Bài PR Bán hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chủ đề bài viết</Label>
            <Input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Tiềm năng tăng giá, Cập nhật tiến độ..."
            />
          </div>

          <div className="space-y-2">
            <Label>Ghi chú thêm cho AI (Tùy chọn)</Label>
            <Textarea 
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="VD: Nhấn mạnh vào view sông, đề cập đến chính sách chiết khấu 5%..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Cung cấp thêm các điểm nhấn (Key selling points) để bài viết sát thực tế hơn.
            </p>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Viết bài ngay
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="h-fit border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Xem trước & Lưu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
               <Label className="font-bold">Tiêu đề:</Label>
               <p className="text-lg font-semibold">{result.title}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg max-h-[400px] overflow-y-auto mb-4 prose prose-sm dark:prose-invert">
               <ReactMarkdown>{result.content}</ReactMarkdown>
            </div>
            <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
              <Save className="mr-2 h-4 w-4" /> Gửi duyệt
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}