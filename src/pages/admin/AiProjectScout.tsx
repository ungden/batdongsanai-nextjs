"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Check, Loader2, FileInput, Building2, MapPin, ArrowRight, Trash2, Save, Plus, AlertCircle } from "lucide-react";

export default function AiProjectScout() {
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [parsedProjects, setParsedProjects] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error("Vui lòng paste danh sách dự án vào ô trống");
      return;
    }
    
    const lineCount = rawText.split('\n').filter(line => line.trim().length > 0).length;
    if (lineCount > 100) {
      toast.warning(`Bạn đang paste ${lineCount} dòng. AI có thể mất một chút thời gian để xử lý.`);
    }

    setProcessing(true);
    setParsedProjects([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('research-project', {
        body: { 
          raw_content: rawText, 
          mode: 'batch_extract' // Gọi chế độ extract thuần túy
        }
      });

      if (error) throw error;
      
      if (data?.data?.projects) {
        const projects = data.data.projects.map((p: any) => ({
          ...p,
          status: 'new',
          importStatus: 'idle'
        }));
        setParsedProjects(projects);
        toast.success(`Đã trích xuất thành công ${projects.length} dự án!`);
      } else {
        toast.info("Không trích xuất được dự án nào. Vui lòng kiểm tra lại định dạng.");
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

    updateProjectStatus(index, 'loading');

    try {
      const dbProject = {
        name: project.name,
        developer: project.developer !== 'Đang cập nhật' ? project.developer : "Đang cập nhật",
        location: project.location !== 'Đang cập nhật' ? project.location : "Đang cập nhật",
        city: "Hồ Chí Minh", // Mặc định, admin có thể sửa sau
        district: "Đang cập nhật",
        status: "upcoming", 
        price_range: "Đang cập nhật",
        price_per_sqm: 0,
        description: project.raw_text || `Dự án ${project.name}`, // Lưu text gốc vào mô tả để tham chiếu
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
      toast.error(`Lỗi thêm ${project.name}`);
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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileInput className="w-6 h-6 text-primary" />
            Batch Upload (Trích xuất từ văn bản)
          </h1>
          <p className="text-muted-foreground">Paste danh sách dự án &rarr; AI tách dữ liệu &rarr; Import hàng loạt</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Column */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>1. Dữ liệu nguồn</CardTitle>
            <CardDescription>
              Dán danh sách của bạn vào đây. AI sẽ tự động nhận diện tên dự án, chủ đầu tư và vị trí từ từng dòng.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            <Textarea 
              placeholder={`Paste danh sách dự án của bạn vào đây (mỗi dự án một dòng). Ví dụ:
1. Vinhomes Grand Park - Quận 9 - Vingroup
2. The Global City - Quận 2 - Masterise Homes
3. Eaton Park - Gamuda Land
4. Sycamore Bình Dương - CapitalLand
...`} 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="flex-1 font-mono text-sm resize-none p-4 bg-muted/10 leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
               <span>{rawText.split('\n').filter(l => l.trim()).length} dòng được phát hiện</span>
               <span>AI Parser Mode</span>
            </div>
            <Button onClick={handleParse} disabled={processing || !rawText} size="lg" className="w-full">
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang trích xuất...</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" /> Phân tích & Trích xuất danh sách</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Action Column */}
        <Card className="flex flex-col h-full bg-muted/10">
          <CardHeader className="border-b bg-card">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>2. Kết quả trích xuất ({parsedProjects.length})</CardTitle>
                <CardDescription>Kiểm tra danh sách trước khi lưu vào Database</CardDescription>
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
                  <p className="text-center">Danh sách sau khi trích xuất sẽ hiện ở đây.<br/>Bạn có thể kiểm tra và xóa các mục sai.</p>
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
                            <div className="font-bold text-sm truncate text-foreground">{p.name}</div>
                            <Badge variant="outline" className="text-[10px] h-5 font-normal">{p.type || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 truncate max-w-[150px]" title={p.developer}><Building2 className="w-3 h-3" /> {p.developer}</span>
                            <span className="flex items-center gap-1 truncate max-w-[150px]" title={p.location}><MapPin className="w-3 h-3" /> {p.location}</span>
                          </div>
                          {/* Debug raw text if needed */}
                          {/* <div className="text-[10px] text-muted-foreground/50 truncate mt-1">{p.raw_text}</div> */}
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