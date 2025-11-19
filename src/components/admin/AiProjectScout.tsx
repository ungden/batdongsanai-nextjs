"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Check, Loader2, Bot, Building2, MapPin } from "lucide-react";

export default function AiProjectScout() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('research-project', {
        body: { query, mode: 'scout' }
      });

      if (error) throw error;
      if (data?.data?.projects) {
        setResults(data.data.projects);
      } else {
        toast.info("Không tìm thấy dự án nào phù hợp.");
      }
    } catch (error: any) {
      toast.error("Lỗi tìm kiếm: " + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (project: any, index: number) => {
    try {
      // Map AI result to DB schema
      const dbProject = {
        name: project.name,
        developer: project.developer,
        location: project.location,
        // Tạm thời điền các trường bắt buộc bằng giá trị mặc định hoặc AI đoán
        city: "Hồ Chí Minh", // Cần logic tốt hơn để parse city từ location
        district: "Đang cập nhật",
        status: project.status === "Sắp mở bán" ? "upcoming" : "good",
        price_range: "Đang cập nhật",
        price_per_sqm: 0,
        description: `Dự án ${project.name} do ${project.developer} phát triển tại ${project.location}.`,
        completion_date: "Đang cập nhật",
        legal_score: 0, // Mặc định thấp để admin review
      };

      const { error } = await supabase.from('projects').insert(dbProject);

      if (error) throw error;
      
      setImportedIds(prev => new Set(prev).add(index));
      toast.success(`Đã import: ${project.name}`);
    } catch (error: any) {
      toast.error(`Lỗi import ${project.name}: ` + error.message);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          AI Project Scout
        </CardTitle>
        <CardDescription>
          Trò chuyện với AI để tìm kiếm và thêm dự án vào hệ thống thay vì nhập tay.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="VD: Tìm các dự án căn hộ cao cấp tại Quận 2 sắp bàn giao..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Tìm kiếm
          </Button>
        </div>

        <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/20">
          {results.length === 0 && !searching && (
            <div className="text-center text-muted-foreground py-10">
              Nhập yêu cầu tìm kiếm để bắt đầu...
            </div>
          )}

          <div className="grid gap-3">
            {results.map((p, idx) => {
              const isImported = importedIds.has(idx);
              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-sm transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{p.name}</h4>
                      <Badge variant="outline">{p.type}</Badge>
                      <Badge variant={p.status?.includes("Sắp") ? "secondary" : "default"}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.developer}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isImported ? "ghost" : "default"}
                    disabled={isImported}
                    onClick={() => handleImport(p, idx)}
                  >
                    {isImported ? <Check className="w-4 h-4 text-green-600" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isImported ? "Đã thêm" : "Import"}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}