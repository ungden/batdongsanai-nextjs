"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, Save, ArrowRight, Database, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CatalystFactory() {
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-data', {
        body: { raw_content: rawText, type: 'catalyst' }
      });

      if (error) throw error;
      
      const result = data.data;
      setFormData({
        title: result.title || "",
        catalyst_type: result.catalyst_type || "infrastructure",
        description: result.description || "",
        impact_level: result.impact_level || "medium",
        impact_direction: result.impact_direction || "positive",
        estimated_price_impact_percent: result.estimated_price_impact_percent || 0,
        affected_areas: Array.isArray(result.affected_areas) ? result.affected_areas.join(", ") : "",
        effective_date: result.effective_date || ""
      });
      
      toast.success("AI đã trích xuất xong! Vui lòng kiểm tra.");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const payload = {
        ...formData,
        affected_areas: formData.affected_areas.split(',').map((s: string) => s.trim()).filter(Boolean),
        verification_status: 'pending' // QUAN TRỌNG: Lưu dưới dạng chờ duyệt
      };

      const { error } = await supabase.from('market_catalysts' as any).insert(payload);
      if (error) throw error;
      
      toast.success("Đã gửi vào hàng đợi duyệt!");
      setFormData(null);
      setRawText("");
      // Option: Redirect to approval center or stay
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-500" />
          Catalyst Factory
        </h1>
        <p className="text-muted-foreground">AI phát hiện & phân tích các yếu tố tác động giá từ tin tức</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>1. Dữ liệu nguồn</CardTitle>
            <CardDescription>Paste nội dung tin tức, thông báo quy hoạch...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Ví dụ: Tuyến Metro số 1 Bến Thành - Suối Tiên dự kiến vận hành thương mại từ tháng 7/2024, kéo theo giá BĐS khu Đông tăng mạnh..."
              className="min-h-[300px]"
            />
            <Button onClick={handleAnalyze} disabled={processing || !rawText} className="w-full">
              {processing ? <Loader2 className="mr-2 animate-spin" /> : "Phân tích ngay"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>2. Kiểm tra & Gửi duyệt</CardTitle>
                    <CardDescription>Dữ liệu sẽ được chuyển đến <strong>Approval Center</strong></CardDescription>
                </div>
                <Database className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {formData ? (
              <div className="space-y-4 bg-background p-4 rounded-lg border shadow-sm">
                <div className="space-y-2">
                  <Label>Tiêu đề (Ngắn gọn)</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại Catalyst</Label>
                    <Select 
                        value={formData.catalyst_type} 
                        onValueChange={(val) => setFormData({...formData, catalyst_type: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Hạ tầng (Cầu, Đường)</SelectItem>
                        <SelectItem value="policy">Chính sách / Luật</SelectItem>
                        <SelectItem value="economic">Kinh tế vĩ mô</SelectItem>
                        <SelectItem value="supply_demand">Cung cầu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mức độ tác động</Label>
                     <Select 
                        value={formData.impact_level} 
                        onValueChange={(val) => setFormData({...formData, impact_level: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_high">Rất cao (Đột biến)</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="low">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Hướng tác động</Label>
                     <Select 
                        value={formData.impact_direction} 
                        onValueChange={(val) => setFormData({...formData, impact_direction: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Tích cực (Tăng giá)</SelectItem>
                        <SelectItem value="negative">Tiêu cực (Giảm giá)</SelectItem>
                        <SelectItem value="neutral">Trung lập</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tác động giá dự kiến (%)</Label>
                    <Input 
                        type="number" 
                        step="0.1"
                        value={formData.estimated_price_impact_percent} 
                        onChange={(e) => setFormData({...formData, estimated_price_impact_percent: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Khu vực ảnh hưởng</Label>
                  <Input 
                    value={formData.affected_areas} 
                    onChange={(e) => setFormData({...formData, affected_areas: e.target.value})} 
                    placeholder="Quận 9, Thủ Đức, Bình Dương..."
                  />
                </div>
                
                 <div className="space-y-2">
                  <Label>Ngày hiệu lực (Dự kiến)</Label>
                  <Input 
                    type="date"
                    value={formData.effective_date} 
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mô tả chi tiết</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
                  <Send className="mr-2 h-4 w-4" /> Gửi duyệt
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                <p>Kết quả phân tích sẽ hiện ở đây để bạn kiểm tra</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}