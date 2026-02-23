"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "structured" | "text";

interface AiImproveButtonProjectProps {
  mode?: Mode;
  section?: string;
  payload: any;
  onResult: (improved: any) => void;
  constraints?: string;
  tone?: string;
  length?: "keep" | "shorten" | "expand";
  label?: string;
  size?: "sm" | "default";
  className?: string;
}

export default function AiImproveButtonProject({
  mode = "structured",
  section = "project_analysis",
  payload,
  onResult,
  constraints = "",
  tone = "chuyên nghiệp, rõ ràng",
  length = "keep",
  label = "AI cải thiện",
  size = "sm",
  className
}: AiImproveButtonProjectProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    if (payload === undefined || payload === null || (typeof payload === "string" && payload.trim() === "")) {
      toast({ title: "Không có nội dung", description: "Vui lòng nhập hoặc chọn nội dung cần cải thiện.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-project-content', {
        body: { mode, section, payload, tone, length, constraints, language: "vi-VN" }
      });
      if (error) throw new Error(error.message);
      const improved = (data as any)?.data ?? (data as any);
      if (!improved) throw new Error("Không nhận được kết quả cải thiện.");
      onResult(improved);
      toast({ title: "Đã cải thiện nội dung", description: "Bạn có thể xem lại trước khi lưu." });
    } catch (e: any) {
      toast({ title: "AI lỗi", description: e.message || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size={size} variant="secondary" onClick={onClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
      {label}
    </Button>
  );
}