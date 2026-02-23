"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LineChart, Save, Building2, Scale, Database, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function MarketResearchFactory() {
  const [mode, setMode] = useState<"infrastructure" | "regulation">("infrastructure");
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Editable form data
  const [formData, setFormData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setProcessing(true);
    setFormData(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-data', {
        body: { raw_content: rawText, type: mode }
      });

      if (error) throw error;
      setFormData(data.data);
      toast.success("Phân tích thành công!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    const table = mode === 'infrastructure' ? 'infrastructure_developments' : 'market_regulations';
    
    try {
      const { error } = await supabase.from(table as any).insert(formData);
      if (error) throw error;
      toast.success(`Đã lưu dữ liệu vào bảng ${table}`);
      setFormData(null);
      setRawText("");
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LineChart className="w-8 h-8 text-blue-500" />
          Market Research Factory
        </h1>
        <p className="text-muted-foreground">AI phân tích dữ liệu hạ tầng và chính sách pháp luật</p>
      </div>

      <Tabs value={mode} onValueChange={(v: any) => { setMode(v); setFormData(null); }}>
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="infrastructure">
            <Building2 className="w-4 h-4 mr-2" /> Hạ tầng
          </TabsTrigger>
          <TabsTrigger value="regulation">
            <Scale className="w-4 h-4 mr-2" /> Pháp luật
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>1. Dữ liệu đầu vào</CardTitle>
            <CardDescription>
              {mode === 'infrastructure' 
                ? "Nhập thông tin dự án cầu đường, sân bay, metro..." 
                : "Nhập nội dung luật, nghị định, thông tư..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={mode === 'infrastructure' 
                ? "Ví dụ: Dự án Vành đai 3 TP.HCM có tổng mức đầu tư 75.300 tỷ đồng, khởi công tháng 6/2023..." 
                : "Ví dụ: Luật Đất đai 2024 quy định mới về bảng giá đất sát với giá thị trường..."}
              className="min-h-[400px]"
            />
            <Button onClick={handleAnalyze} disabled={processing || !rawText} className="w-full">
              {processing ? <Loader2 className="mr-2 animate-spin" /> : "Phân tích AI"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                 <CardTitle>2. Kiểm tra & Chỉnh sửa</CardTitle>
                 <CardDescription>
                   Lưu vào: <strong>{mode === 'infrastructure' ? 'infrastructure_developments' : 'market_regulations'}</strong>
                 </CardDescription>
              </div>
              <Database className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {formData ? (
              <div className="space-y-4 bg-background p-4 rounded-lg border shadow-sm">
                {mode === 'infrastructure' ? (
                  // INFRASTRUCTURE FORM
                  <>
                    <div className="space-y-2">
                      <Label>Tên dự án</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="font-semibold"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Loại hình</Label>
                            <Select value={formData.infrastructure_type} onValueChange={(v) => setFormData({...formData, infrastructure_type: v})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="metro">Metro</SelectItem>
                                    <SelectItem value="road">Đường bộ</SelectItem>
                                    <SelectItem value="bridge">Cầu</SelectItem>
                                    <SelectItem value="airport">Sân bay</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Quy hoạch</SelectItem>
                                    <SelectItem value="under_construction">Đang thi công</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Vốn đầu tư (VNĐ)</Label>
                           <Input type="number" value={formData.budget_vnd} onChange={(e) => setFormData({...formData, budget_vnd: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <Label>Tác động giá (%)</Label>
                           <Input type="number" step="0.1" value={formData.estimated_property_impact_percent} onChange={(e) => setFormData({...formData, estimated_property_impact_percent: e.target.value})} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Khởi công (Dự kiến)</Label>
                           <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <Label>Hoàn thành (Dự kiến)</Label>
                           <Input type="date" value={formData.expected_completion} onChange={(e) => setFormData({...formData, expected_completion: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Khu vực (Quận/Huyện)</Label>
                      <Input value={formData.location_district} onChange={(e) => setFormData({...formData, location_district: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả chi tiết</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} />
                    </div>
                  </>
                ) : (
                  // REGULATION FORM
                  <>
                    <div className="space-y-2">
                      <Label>Tiêu đề văn bản</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="font-semibold"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Số hiệu</Label>
                            <Input value={formData.regulation_number} onChange={(e) => setFormData({...formData, regulation_number: e.target.value})} />
                        </div>
                         <div className="space-y-2">
                            <Label>Cơ quan ban hành</Label>
                            <Input value={formData.issuing_authority} onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Loại văn bản</Label>
                            <Select value={formData.regulation_type} onValueChange={(v) => setFormData({...formData, regulation_type: v})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="law">Luật</SelectItem>
                                    <SelectItem value="decree">Nghị định</SelectItem>
                                    <SelectItem value="circular">Thông tư</SelectItem>
                                    <SelectItem value="decision">Quyết định</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                           <Label>Ngày hiệu lực</Label>
                           <Input type="date" value={formData.effective_date} onChange={(e) => setFormData({...formData, effective_date: e.target.value})} />
                        </div>
                    </div>
                     <div className="space-y-2">
                      <Label>Tác động đến người mua</Label>
                      <Textarea value={formData.impact_on_buyers} onChange={(e) => setFormData({...formData, impact_on_buyers: e.target.value})} rows={2} />
                    </div>
                     <div className="space-y-2">
                      <Label>Tác động đến nhà đầu tư</Label>
                      <Textarea value={formData.impact_on_investors} onChange={(e) => setFormData({...formData, impact_on_investors: e.target.value})} rows={2} />
                    </div>
                     <div className="space-y-2">
                      <Label>Nội dung chính</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                    </div>
                  </>
                )}

                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
                  <Save className="mr-2 h-4 w-4" /> Lưu vào Database
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                <p>Dữ liệu sau khi phân tích sẽ hiện ở đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}