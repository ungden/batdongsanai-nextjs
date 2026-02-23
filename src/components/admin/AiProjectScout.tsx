"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Fixed: Added import
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Check, Loader2, FileInput, Building2, MapPin, ArrowRight, Trash2, Save, Plus, Search, Bot } from "lucide-react";

export default function AiProjectScout() {
  const [query, setQuery] = useState("");
  const [rawText, setRawText] = useState("");
  
  const [searching, setSearching] = useState(false); // Scout loading
  const [processing, setProcessing] = useState(false); // Batch loading
  
  const [scoutResults, setScoutResults] = useState<any[]>([]);
  const [parsedProjects, setParsedProjects] = useState<any[]>([]);
  
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set()); // For Scout results
  const [batchImportedIds, setBatchImportedIds] = useState<Set<number>>(new Set()); // For Batch results

  // --- 1. SCOUT (TÌM KIẾM) ---
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setScoutResults([]);
    
    try {
      // B1: Research (Text)
      const { data: resData, error: resError } = await supabase.functions.invoke('research-project', {
        body: { query, mode: 'scout' }
      });
      if (resError) throw resError;
      
      const reportText = resData.data;

      // B2: Structure (JSON)
      const { data: structData, error: structError } = await supabase.functions.invoke('structure-data', {
        body: { content: reportText, type: 'project_list' }
      });
      if (structError) throw structError;

      if (structData?.data?.projects) {
        setScoutResults(structData.data.projects);
      } else {
        toast.info("Không tìm thấy dự án nào phù hợp.");
      }
    } catch (error: any) {
      toast.error("Lỗi tìm kiếm: " + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleImportScout = async (project: any, index: number) => {
    // Reuse import logic...
    await importProjectToDB(project, () => {
        setImportedIds(prev => new Set(prev).add(index));
    });
  };

  // --- 2. BATCH PARSE (NHẬP LIỆU) ---
  const handleBatchParse = async () => {
    if (!rawText.trim()) return;
    setProcessing(true);
    setParsedProjects([]);

    try {
       // B1: Pre-process Text (Optional, or reuse raw input if it's simple)
       // Gọi research-project mode batch_extract để Gemini Pro dọn dẹp text trước
       const { data: resData, error: resError } = await supabase.functions.invoke('research-project', {
        body: { raw_content: rawText, mode: 'batch_extract' }
      });
      if (resError) throw resError;
      const cleanListText = resData.data;

      // B2: Structure JSON
      const { data: structData, error: structError } = await supabase.functions.invoke('structure-data', {
        body: { content: cleanListText, type: 'raw_list' }
      });
      if (structError) throw structError;

      if (structData?.data?.projects) {
         setParsedProjects(structData.data.projects.map((p:any) => ({...p, importStatus: 'idle'})));
         toast.success(`Đã trích xuất ${structData.data.projects.length} dự án.`);
      }
    } catch (error: any) {
      toast.error("Lỗi xử lý: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleImportBatchSingle = async (index: number) => {
     const p = parsedProjects[index];
     setParsedProjects(prev => prev.map((item, i) => i === index ? { ...item, importStatus: 'loading' } : item));
     
     await importProjectToDB(p, (success) => {
        setParsedProjects(prev => prev.map((item, i) => i === index ? { ...item, importStatus: success ? 'success' : 'error' } : item));
     });
  };

  // Shared DB Import Logic
  const importProjectToDB = async (project: any, callback: (success: boolean) => void) => {
    try {
        // Generate slug ID
        const slug = project.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const newId = `${slug}-${Math.floor(Math.random() * 10000)}`;

        const dbProject = {
            id: newId,
            name: project.name,
            developer: project.developer || "Đang cập nhật",
            location: project.location || "Đang cập nhật",
            city: "Hồ Chí Minh",
            district: "Đang cập nhật",
            status: "upcoming",
            price_range: "Đang cập nhật",
            price_per_sqm: 0,
            description: project.raw_text || `Dự án ${project.name}.`,
            completion_date: "Đang cập nhật",
            legal_score: 0,
        };

        const { error } = await supabase.from('projects').insert(dbProject);
        if (error) throw error;
        toast.success(`Đã import: ${project.name}`);
        callback(true);
    } catch (e: any) {
        console.error(e);
        toast.error(`Lỗi import: ${e.message}`);
        callback(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        {/* LEFT: AI SCOUT */}
        <Card className="flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Bot className="w-5 h-5 text-blue-500" /> AI Scout (Tìm kiếm)
             </CardTitle>
             <div className="flex gap-2 mt-2">
               <Input 
                 placeholder="VD: Tìm dự án mới tại Quận 2..." 
                 value={query} 
                 onChange={(e) => setQuery(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
               />
               <Button onClick={handleSearch} disabled={searching}>
                 {searching ? <Loader2 className="animate-spin" /> : <Search />}
               </Button>
             </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
             <ScrollArea className="h-full p-4">
               <div className="space-y-3">
                 {scoutResults.map((p, idx) => (
                   <div key={idx} className="border p-3 rounded-lg bg-card flex justify-between items-center">
                     <div>
                       <div className="font-bold text-sm">{p.name}</div>
                       <div className="text-xs text-muted-foreground">{p.developer} • {p.location}</div>
                     </div>
                     <Button size="sm" variant={importedIds.has(idx) ? "ghost" : "default"} onClick={() => handleImportScout(p, idx)} disabled={importedIds.has(idx)}>
                        {importedIds.has(idx) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                     </Button>
                   </div>
                 ))}
                 {scoutResults.length === 0 && !searching && <div className="text-center text-muted-foreground text-sm py-10">Nhập từ khóa để tìm dự án từ Internet</div>}
               </div>
             </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT: BATCH UPLOAD */}
        <Card className="flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <UploadCloud className="w-5 h-5 text-green-500" /> Batch Upload
             </CardTitle>
             <CardDescription>Paste danh sách thô để nhập hàng loạt</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
             <Textarea 
               className="flex-1 font-mono text-xs" 
               placeholder="Dán danh sách dự án vào đây..."
               value={rawText}
               onChange={(e) => setRawText(e.target.value)}
             />
             <Button onClick={handleBatchParse} disabled={processing} className="w-full">
               {processing ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-4 w-4" />}
               Phân tích & Trích xuất
             </Button>
             
             {parsedProjects.length > 0 && (
               <div className="border rounded-md p-2 bg-muted/20 flex-1 overflow-y-auto max-h-[300px]">
                  <div className="text-xs font-bold mb-2 px-2">Kết quả ({parsedProjects.length})</div>
                  {parsedProjects.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border-b last:border-0 text-sm">
                       <span className="truncate max-w-[200px]">{p.name}</span>
                       <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleImportBatchSingle(idx)} disabled={p.importStatus === 'success' || p.importStatus === 'loading'}>
                         {p.importStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                          p.importStatus === 'success' ? <Check className="w-3 h-3 text-green-500" /> : 
                          <Save className="w-3 h-3" />}
                       </Button>
                    </div>
                  ))}
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}