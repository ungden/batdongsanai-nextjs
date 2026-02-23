"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { projectsData } from "@/data/projectsData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, PenTool, Save, RefreshCw, Copy, Database, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

export default function ContentStudio() {
  const [projectId, setProjectId] = useState("none");
  const [contentType, setContentType] = useState("news");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("chuyên nghiệp");
  
  const [generating, setGenerating] = useState(false);
  
  // Editable Result State
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

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
          type: contentType, 
          context: contextData,
          tone: tone,
          language: 'vi-VN'
        }
      });

      if (error) throw error;
      
      const result = data.data;
      setEditedTitle(result.title || "");
      setEditedContent(result.content || "");
      setEditedSummary(result.summary || result.meta_description || "");
      
      toast.success("Đã tạo nội dung! Bạn hãy kiểm tra và chỉnh sửa.");
      setActiveTab("edit"); // Switch to edit mode automatically
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editedTitle || !editedContent) {
      toast.error("Tiêu đề và nội dung không được để trống");
      return;
    }
    try {
      const { error } = await supabase.from('content_items').insert({
        title: editedTitle,
        content: editedContent,
        type: 'news', // Mapping to DB type
        status: 'draft',
        meta_title: editedTitle,
        meta_description: editedSummary,
        // Assuming keywords generated implicitly or empty for now
      });

      if (error) throw error;
      toast.success("Đã lưu bản nháp vào CMS (Bảng: content_items)");
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

        {/* Editor Panel */}
        <Card className="lg:col-span-3 min-h-[600px] flex flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Biên tập & Lưu trữ</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Database className="w-3 h-3" />
                <span>Lưu vào: <strong>content_items</strong></span>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Chỉnh sửa (Markdown)</TabsTrigger>
                <TabsTrigger value="preview">Xem trước</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="flex-1 p-6">
              {!editedContent ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <PenTool className="w-16 h-16" />
                  <p>Nội dung AI tạo sẽ hiển thị tại đây để bạn chỉnh sửa</p>
                </div>
              ) : (
                <TabsContent value="edit" className="mt-0 h-full space-y-4">
                   <div className="space-y-2">
                     <Label>Tiêu đề bài viết</Label>
                     <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="font-bold text-lg" />
                   </div>
                   <div className="space-y-2 h-[calc(100%-80px)]">
                     <Label>Nội dung (Markdown)</Label>
                     <Textarea 
                        value={editedContent} 
                        onChange={(e) => setEditedContent(e.target.value)} 
                        className="h-full font-mono text-sm leading-relaxed"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Tóm tắt (Meta Description)</Label>
                     <Textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} rows={2} />
                   </div>
                </TabsContent>
              )}

              {editedContent && (
                <TabsContent value="preview" className="mt-0 h-full overflow-y-auto pr-2">
                  <h1 className="text-2xl font-bold mb-4">{editedTitle}</h1>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{editedContent}</ReactMarkdown>
                  </div>
                </TabsContent>
              )}
            </CardContent>
          </Tabs>

          <CardFooter className="border-t p-4 flex justify-end gap-2 bg-muted/10">
             {editedContent && (
                <>
                  <Button variant="outline" onClick={() => {setEditedContent(""); setEditedTitle("");}}>
                    Xóa
                  </Button>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" /> Lưu bản nháp
                  </Button>
                </>
             )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}