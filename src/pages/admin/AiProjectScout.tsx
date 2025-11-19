"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Check, Loader2, Bot, Building2, MapPin, ArrowRight, Trash2, Save, Plus } from "lucide-react";

export default function AiProjectScout() {
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [parsedProjects, setParsedProjects] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error("Vui lòng nhập danh sách dự án");
      return;
    }
    setProcessing(true);
    setParsedProjects([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('research-project', {
        body: { 
          raw_content: rawText, 
          mode: 'batch_extract' 
        }
      });

      if (error) throw error;
      
      if (data?.data?.projects) {
        const projects = data.data.projects.map((p: any) => ({
          ...p,
          status: 'new' // UI status, not DB status yet
        }));
        setParsedProjects(projects);
        toast.success(`AI đã tìm thấy ${projects.length} dự án!`);
      } else {
        toast.info("Không trích xuất được dự án nào. Vui lòng kiểm tra lại nội dung.");
      }
    } catch (error: any) {
      toast.error("Lỗi phân tích: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleImportSingle = async (index: number) => {
    const project = parsedProjects[index];
    if (project.importStatus === 'success') return;

    // Optimistic update
    updateProjectStatus(index, 'loading');

    try {
      const dbProject = {
        name: project.name,
        developer: project.developer || "Đang cập nhật",
        location: project.location || "Đang cập nhật",
        city: "Hồ Chí Minh", // Default, could be refined by AI
        district: "Đang cập nhật",
        status: "upcoming", // Default to upcoming/new
        price_range: "Đang cập nhật",
        price_per_sqm: 0,
        description: `Dự án ${project.name} ${project.developer ? `do ${project.developer} phát triển` : ''}.`,
        completion_date: "Đang cập nhật",
        legal_score: 0,
      };

      const { error } = await supabase.from('projects').insert(dbProject);

      if (error) throw error;
      
      updateProjectStatus(index, 'success');
      setImportedCount(prev => prev + 1);
      toast.success(`Đã thêm: ${project.name}`);
    } catch (error: any) {
      console.error(error);
      updateProjectStatus(index, 'error');
      toast.error(`Lỗi thêm ${project.name}`);
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true);
    let success = 0;
    
    // Process one by one to avoid overwhelming DB or hitting rate limits if we added logic later
    // Also allows for visual progress updates
    for (let i = 0; i < parsedProjects.length; i++) {
      if (parsedProjects[i].importStatus !== 'success') {
        await handleImportSingle(i);
        // Small delay to make UI updates visible and smooth
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    setIsImporting(false);
    toast.success("Hoàn tất import danh sách!");
  };

  const updateProjectStatus = (index: number, status: 'loading' | 'success' | 'error') => {
    setParsedProjects(prev => prev.map((p, i) => i === index ? { ...p, importStatus: status } : p));
  };

  const removeProject = (index: number) => {
    setParsedProjects(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Batch Upload (AI Parser)
          </h1>
          <p className="text-muted-foreground">Paste danh sách văn bản thô &rarr; AI trích xuất &rarr; Import hàng loạt</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Column */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>1. Dữ liệu nguồn</CardTitle>
            <CardDescription>
              Dán danh sách dự án của bạn vào đây (Excel copy, list văn bản, chat log...)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            <Textarea 
              placeholder={`Ví dụ:\n1. Vinhomes Grand Park - Quận 9 - Vingroup\n2. The Global City - Quận 2 - Masterise\n3. Eaton Park - Thủ Đức - Gamuda Land\n...`} 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="flex-1 font-mono text-sm resize-none p-4"
            />
            <Button onClick={handleParse} disabled={processing || !rawText} size="lg" className="w-full">
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang phân tích AI...</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" /> Phân tích & Trích xuất</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Action Column */}
        <Card className="flex flex-col h-full bg-muted/10">
          <CardHeader className="border-b bg-card">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>2. Kết quả ({parsedProjects.length})</CardTitle>
                <CardDescription>Review trước khi lưu vào Database</CardDescription>
              </div>
              {parsedProjects.length > 0 && (
                <Button 
                  onClick={handleImportAll} 
                  disabled={isImporting || parsedProjects.every(p => p.importStatus === 'success')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Import Tất cả ({parsedProjects.length - importedCount})
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
             <ScrollArea className="h-full p-4">
              {parsedProjects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <UploadCloud className="w-16 h-16 mb-4" />
                  <p>Danh sách dự án sẽ hiện ở đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedProjects.map((p, idx) => {
                    const isImported = p.importStatus === 'success';
                    const isLoading = p.importStatus === 'loading';
                    
                    return (
                      <div key={idx} className={`
                        flex items-center justify-between p-3 bg-card border rounded-lg transition-all
                        ${isImported ? 'border-green-200 bg-green-50 opacity-80' : 'hover:shadow-md'}
                      `}>
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm truncate">{p.name}</h4>
                            <Badge variant="outline" className="text-[10px] h-5">{p.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.developer}</span>
                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {p.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isImported ? (
                             <Badge className="bg-green-600 hover:bg-green-600">Đã thêm</Badge>
                          ) : (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeProject(idx)}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="default"
                                disabled={isLoading}
                                onClick={() => handleImportSingle(idx)}
                                className="h-8"
                              >
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                                Thêm
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}