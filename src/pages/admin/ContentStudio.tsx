"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { projectsData } from "@/data/projectsData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, PenTool, Save, RefreshCw, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function ContentStudio() {
  const [projectId, setProjectId] = useState("none");
  const [contentType, setContentType] = useState("news");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("chuyên nghiệp");
  
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic && projectId === "none") {
      toast.error("Vui lòng nhập chủ đề hoặc chọn dự án");
      return;
    }

    setGenerating(true);
    try {
      // Xây dựng ngữ cảnh từ dự án nếu có
      let contextData = "";
      if (projectId !== "none") {
        const p = projectsData.find(x => x.id === projectId);
        if (p) {
          contextData = `
DỰ ÁN: ${p.name}
VỊ TRÍ: ${p.location} (${p.district})
CHỦ ĐẦU TƯ: ${p.developer}
GIÁ: ${p.priceRange} (~${(p.pricePerSqm/1000000).toFixed(1)} tr/m2)
TIỆN ÍCH: ${p.amenities?.join(", ")}
TRẠNG THÁI: ${p.status === 'good' ? 'Pháp lý tốt' : 'Đang cập nhật'}
          `.trim();
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'generate',
          topic: topic || `Bài viết về dự án`,
          type: contentType, // news, page, blog
          context: contextData,
          tone: tone,
          language: 'vi-VN'
        }
      });

      if (error) throw error;
      
      setResult(data.data);
      toast.success("Đã tạo nội dung thành công!");
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
        type: 'news', // Map to DB type
        status: 'draft',
        meta_title: result.meta_title,
        meta_description: result.summary,
        keywords: result.keywords
      });

      if (error) throw error;
      toast.success("Đã lưu vào CMS (Bản nháp)");
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PenTool className="w-8 h-8 text-purple-500" />
          Content Studio
        </h1>
        <p className="text-muted-foreground">Nhà báo AI: Viết bài SEO, PR dự án và tin tức thị trường tự động</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Cấu hình bài viết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dự án (Ngữ cảnh)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dự án..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tự do (Không theo dự án) --</SelectItem>
                  {projectsData.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loại nội dung</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">Tin tức / Sự kiện</SelectItem>
                  <SelectItem value="blog">Blog / Kiến thức</SelectItem>
                  <SelectItem value="pr">Bài PR Bán hàng</SelectItem>
                  <SelectItem value="market_analysis">Phân tích thị trường</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giọng văn</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chuyên nghiệp">Chuyên nghiệp, Khách quan</SelectItem>
                  <SelectItem value="hào hứng">Hào hứng, Bán hàng (Sale)</SelectItem>
                  <SelectItem value="thân thiện">Thân thiện, Chia sẻ</SelectItem>
                  <SelectItem value="cảnh báo">Thận trọng, Cảnh báo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chủ đề / Từ khóa chính</Label>
              <Textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={projectId === "none" ? "VD: Xu hướng BĐS khu Đông 2024..." : "VD: Tiềm năng tăng giá, Phân tích pháp lý..."}
                rows={3}
              />
            </div>

            <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
              {generating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 w-4 h-4" />}
              Viết bài ngay
            </Button>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="lg:col-span-3 min-h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex justify-between items-center">
              Kết quả
              {result && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => {navigator.clipboard.writeText(result.content); toast.success("Đã copy");}}>
                     <Copy className="w-4 h-4" />
                   </Button>
                   <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                     <Save className="w-4 h-4 mr-2" /> Lưu nháp
                   </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            {result ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Tiêu đề (SEO)</Label>
                  <h2 className="text-xl font-bold text-foreground mt-1">{result.title}</h2>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Tóm tắt</Label>
                  <p className="text-sm text-muted-foreground italic mt-1">{result.summary || result.meta_description}</p>
                </div>

                <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-lg border">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>

                {result.keywords && (
                   <div className="flex gap-2 flex-wrap">
                     {result.keywords.map((k: string, i: number) => (
                       <Badge key={i} variant="secondary">#{k}</Badge>
                     ))}
                   </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                <PenTool className="w-16 h-16" />
                <p>Nội dung AI tạo sẽ hiển thị tại đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}