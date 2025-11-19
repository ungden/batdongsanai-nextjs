"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, Save, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CatalystFactory() {
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-data', {
        body: { raw_content: rawText, type: 'catalyst' }
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
    try {
      const { error } = await supabase.from('market_catalysts' as any).insert(result);
      if (error) throw error;
      toast.success("Đã lưu Catalyst vào Database");
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
          <Zap className="w-8 h-8 text-yellow-500" />
          Catalyst Factory
        </h1>
        <p className="text-muted-foreground">AI phát hiện & phân tích các yếu tố tác động giá (Tin tức hạ tầng, chính sách...)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nguồn tin</CardTitle>
            <CardDescription>Paste nội dung tin tức, thông báo quy hoạch...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Ví dụ: Tuyến Metro số 1 Bến Thành - Suối Tiên dự kiến vận hành thương mại từ tháng 7/2024..."
              className="min-h-[300px]"
            />
            <Button onClick={handleAnalyze} disabled={processing || !rawText} className="w-full">
              {processing ? <Loader2 className="mr-2 animate-spin" /> : "Phân tích ngay"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Kết quả AI</CardTitle>
            <CardDescription>Dữ liệu trích xuất tự động</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tiêu đề</Label>
                    <div className="font-bold text-lg">{result.title}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">{result.catalyst_type}</Badge>
                    <Badge className={result.impact_direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}>
                      {result.impact_direction}
                    </Badge>
                    <Badge variant="secondary">{result.impact_level} impact</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Khu vực</Label>
                      <div>{result.affected_areas?.join(', ')}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Tác động giá</Label>
                      <div className="font-bold text-primary">{result.estimated_price_impact_percent}%</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Mô tả</Label>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" /> Lưu vào Database
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                <p>Kết quả sẽ hiện ở đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}