"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LineChart, Save, Building2, Scale } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function MarketResearchFactory() {
  const [mode, setMode] = useState<"infrastructure" | "regulation">("infrastructure");
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-data', {
        body: { raw_content: rawText, type: mode }
      });

      if (error) throw error;
      setResult(data.data);
      toast.success("Phân tích thành công!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const table = mode === 'infrastructure' ? 'infrastructure_developments' : 'market_regulations';
    
    try {
      const { error } = await supabase.from(table as any).insert(result);
      if (error) throw error;
      toast.success(`Đã lưu vào bảng ${table}`);
      setResult(null);
      setRawText("");
    } catch (error: any) {
      toast.error("Lỗi lưu: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LineChart className="w-8 h-8 text-blue-500" />
          Market Research Factory
        </h1>
        <p className="text-muted-foreground">AI phân tích dữ liệu hạ tầng và chính sách pháp luật</p>
      </div>

      <Tabs value={mode} onValueChange={(v: any) => { setMode(v); setResult(null); }}>
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="infrastructure">
            <Building2 className="w-4 h-4 mr-2" /> Hạ tầng
          </TabsTrigger>
          <TabsTrigger value="regulation">
            <Scale className="w-4 h-4 mr-2" /> Pháp luật
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dữ liệu đầu vào</CardTitle>
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
                ? "Ví dụ: Dự án Vành đai 3 TP.HCM có tổng mức đầu tư 75.300 tỷ đồng..." 
                : "Ví dụ: Luật Đất đai 2024 quy định mới về bảng giá đất..."}
              className="min-h-[300px]"
            />
            <Button onClick={handleAnalyze} disabled={processing || !rawText} className="w-full">
              {processing ? <Loader2 className="mr-2 animate-spin" /> : "Phân tích AI"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Kết quả trích xuất</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border space-y-2 overflow-hidden">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}