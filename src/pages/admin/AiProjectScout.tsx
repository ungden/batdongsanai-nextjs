"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Check, Loader2, FileInput, Building2, MapPin, ArrowRight, Trash2, Save, Plus, AlertCircle } from "lucide-react";

export default function AiProjectScout() {
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedProjects, setParsedProjects] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // Hàm tạo slug từ tên dự án để làm ID
  const generateId = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9]+/g, "-") // Thay ký tự đặc biệt bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở đầu/cuối
    
    // Thêm số ngẫu nhiên ngắn để tránh trùng lặp ID nếu tên dự án giống nhau
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${slug}-${randomSuffix}`;
  };

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error("Vui lòng paste danh sách dự án vào ô trống");
      return;
    }
    
    const allLines = rawText.split('\n').filter(line => line.trim().length > 0);
    if (allLines.length === 0) return;
    
    if (allLines.length > 100) {
      toast.warning(`Bạn đang paste ${allLines.length} dòng. AI có thể mất một chút thời gian để xử lý.`);
    }

    setProcessing(true);
    setParseProgress(0);
    setParsedProjects([]); // Reset list

    // Cấu hình chunk
    const CHUNK_SIZE = 10; // Xử lý 10 dòng mỗi lần để an toàn
    const totalChunks = Math.ceil(allLines.length / CHUNK_SIZE);
    let successCount = 0;

    try {
      for (let i = 0; i < totalChunks; i++) {
        // Cắt 1 phần text để gửi đi
        const chunkLines = allLines.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkText = chunkLines.join('\n');

        try {
          const { data, error } = await supabase.functions.invoke('research-project', {
            body: { 
              raw_content: chunkText, 
              mode: 'batch_extract' 
            }
          });

          if (error) throw error;
          
          if (data?.data?.projects) {
            const newProjects = data.data.projects.map((p: any) => ({
              ...p,
              status: 'new',
              importStatus: 'idle'
            }));
            
            // Cập nhật UI ngay khi có kết quả của chunk này
            setParsedProjects(prev => [...prev, ...newProjects]);
            successCount += newProjects.length;
          }
        } catch (err) {
          console.error(`Lỗi chunk ${i + 1}:`, err);
          toast.error(`Lỗi xử lý nhóm dòng ${i * CHUNK_SIZE + 1} - ${(i + 1) * CHUNK_SIZE}`);
        }

        // Update progress bar
        setParseProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      if (successCount > 0) {
        toast.success(`Hoàn tất! Đã trích xuất ${successCount} dự án.`);
      } else {
        toast.warning("Không trích xuất được dự án nào. Vui lòng kiểm tra định dạng text.");
      }

    } catch (error: any) {
      toast.error("Lỗi hệ thống: " + error.message);
    } finally {
      setProcessing(false);
      setParseProgress(0);
    }
  };

  const handleImportSingle = async (index: number) => {
    const project = parsedProjects[index];
    if (project.importStatus === 'success') return;

    updateProjectStatus(index, 'loading');

    try {
      // Tạo ID thủ công vì DB không tự sinh
      const newId = generateId(project.name);

      const dbProject = {
        id: newId, // Fix lỗi: Thêm ID vào payload
        name: project.name,
        developer: project.developer !== 'Đang cập nhật' ? project.developer : "Đang cập nhật",
        location: project.location !== 'Đang cập nhật' ? project.location : "Đang cập nhật",
        city: "Hồ Chí Minh", // Mặc định, admin có thể sửa sau
        district: "Đang cập nhật",
        status: "upcoming", 
        price_range: "Đang cập nhật",
        price_per_sqm: 0,
        description: project.raw_text || `Dự án ${project.name} ${project.developer ? `do ${project.developer} phát triển` : ''}.`,
        completion_date: "Đang cập nhật",
        legal_score: 0,
      };

      const { error } = await supabase.from('projects').insert(dbProject);

      if (error) throw error;
      
      updateProjectStatus(index, 'success');
      setImportedCount(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
      updateProjectStatus(index, 'error');
      toast.error(`Lỗi thêm ${project.name}: ${error.message}`);
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true);
    
    // Xử lý tuần tự để tránh quá tải DB và hiển thị progress
    for (let i = 0; i < parsedProjects.length; i++) {
      if (parsedProjects[i].importStatus !== 'success') {
        await handleImportSingle(i);
        // Delay nhỏ để UI update mượt mà
        await new Promise(r => setTimeout(r, 50));
      }
    }
    
    setIsImporting(false);
    toast.success("Đã hoàn tất quá trình Import!");
  };

  const updateProjectStatus = (index: number, status: 'loading' | 'success' | 'error') => {
    setParsedProjects(prev => prev.map((p, i) => i === index ? { ...p, importStatus: status } : p));
  };

  const removeProject = (index: number) => {
    setParsedProjects(prev => prev.filter((_, i) => i !== index));
  };

  const lineCount = rawText.split('\n').filter(l => l.trim()).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileInput className="w-6 h-6 text-primary" />
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
              placeholder={`Paste danh sách dự án của bạn vào đây (mỗi dự án một dòng). Ví dụ:
1. Vinhomes Grand Park - Quận 9 - Vingroup
2. The Global City - Quận 2 - Masterise Homes
3. Eaton Park - Thủ Đức - Gamuda Land
...`} 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="flex-1 font-mono text-sm resize-none p-4"
            />
            
            <div className="space-y-2">
               <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>{lineCount} dòng được phát hiện</span>
                  <span>Batch Size: 10 items/req</span>
               </div>
               
               {processing && (
                 <div className="space-y-1">
                   <Progress value={parseProgress} className="h-2" />
                   <p className="text-xs text-center text-muted-foreground">Đang xử lý... {parseProgress}%</p>
                 </div>
               )}

               <Button onClick={handleParse} disabled={processing || !rawText} size="lg" className="w-full">
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang phân tích...</>
                ) : (
                  <><ArrowRight className="w-4 h-4 mr-2" /> Phân tích & Trích xuất</>
                )}
              </Button>
            </div>
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
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
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
                  <p>Danh sách dự án sẽ hiện ở đây sau khi phân tích.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedProjects.map((p, idx) => {
                    const isImported = p.importStatus === 'success';
                    const isLoading = p.importStatus === 'loading';
                    const isError = p.importStatus === 'error';
                    
                    return (
                      <div key={idx} className={`
                        flex items-center justify-between p-3 bg-card border rounded-lg transition-all
                        ${isImported ? 'border-green-200 bg-green-50 opacity-80' : isError ? 'border-red-200 bg-red-50' : 'hover:shadow-md'}
                      `}>
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm truncate">{p.name}</h4>
                            <Badge variant="outline" className="text-[10px] h-5 font-normal">{p.type || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 truncate max-w-[150px]" title={p.developer}><Building2 className="w-3 h-3" /> {p.developer}</span>
                            <span className="flex items-center gap-1 truncate max-w-[150px]" title={p.location}><MapPin className="w-3 h-3" /> {p.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isImported ? (
                             <Badge className="bg-green-600 hover:bg-green-600 gap-1 px-2">
                               <Check className="w-3 h-3" /> Đã thêm
                             </Badge>
                          ) : (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeProject(idx)}
                                disabled={isLoading || isImporting}
                                title="Xóa khỏi danh sách"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                disabled={isLoading || isImporting}
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