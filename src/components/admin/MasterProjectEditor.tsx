"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, ScanSearch, ArrowRight, Check, FileText, Code, RefreshCw } from "lucide-react";

interface MasterEditorProps {
  projectId: string;
  onSave?: () => void;
}

export default function MasterProjectEditor({ projectId, onSave }: MasterEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({});

  // --- Deep Scan Wizard State ---
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'researching' | 'review_text' | 'structuring' | 'review_json'>('idle');
  const [researchText, setResearchText] = useState("");
  // Thay vì lưu object, lưu string để user có thể sửa
  const [jsonString, setJsonString] = useState(""); 

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const { data: p, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      toast.error("Không tải được dữ liệu dự án");
    } else {
      setData(p || {});
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Đã cập nhật thông tin dự án");
      if (onSave) onSave();
    } catch (error: any) {
      toast.error("Lỗi lưu dữ liệu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Step 1: Research ---
  const startDeepScan = async () => {
    if (!data.name) {
      toast.error("Tên dự án đang trống");
      return;
    }
    setShowScanDialog(true);
    setScanStep('researching');
    setResearchText("");
    setJsonString("");

    try {
      const { data: resData, error } = await supabase.functions.invoke('research-project', {
        body: { query: data.name, mode: 'deep_scan' }
      });

      if (error) throw error;
      setResearchText(resData.data || "Không tìm thấy thông tin.");
      setScanStep('review_text');
    } catch (error: any) {
      toast.error("Lỗi tìm kiếm: " + error.message);
      setScanStep('idle');
      setShowScanDialog(false);
    }
  };

  // --- Step 2: Structure ---
  const processStructure = async () => {
    if (!researchText.trim()) return;
    setScanStep('structuring');

    try {
      const { data: structData, error } = await supabase.functions.invoke('structure-data', {
        body: { content: researchText, type: 'project_detail' }
      });

      if (error) throw error;
      
      // Format JSON đẹp để user dễ đọc/sửa
      setJsonString(JSON.stringify(structData.data, null, 2));
      setScanStep('review_json');
    } catch (error: any) {
      toast.error("Lỗi định dạng: " + error.message);
      setScanStep('review_text');
    }
  };

  // Helper to find value in nested object using multiple key variations
  const findValue = (obj: any, keys: string[]): any => {
    if (!obj) return undefined;
    
    // 1. Search in current level
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    
    // 2. Search in common sub-objects (flattening)
    const subObjects = ['specs', 'pricing', 'overview', 'details', 'info'];
    for (const sub of subObjects) {
      if (obj[sub]) {
        for (const key of keys) {
          if (obj[sub][key] !== undefined && obj[sub][key] !== null) return obj[sub][key];
        }
      }
    }
    
    return undefined;
  };

  // --- Step 3: Apply ---
  const applyData = () => {
    try {
      const aiData = JSON.parse(jsonString); // Parse từ text user đã có thể sửa
      const newData = { ...data };

      console.log("Applying AI Data:", aiData);

      // Mapping thông minh hơn: Tìm kiếm cả snake_case và camelCase, ở root hoặc nested
      
      // 1. Description
      const desc = findValue(aiData, ['description', 'mo_ta', 'summary']);
      if (desc) newData.description = desc;

      // 2. Total Units
      const units = findValue(aiData, ['total_units', 'totalUnits', 'so_can']);
      if (units) newData.total_units = parseInt(units);

      // 3. Floors
      const floors = findValue(aiData, ['total_floors', 'floors', 'so_tang']);
      if (floors) newData.floors = parseInt(floors);

      // 4. Price per m2
      const priceSqm = findValue(aiData, ['price_per_sqm', 'pricePerSqm', 'gia_m2', 'current_price']);
      if (priceSqm) newData.price_per_sqm = parseInt(priceSqm);

      // 5. Launch Price
      const launchPrice = findValue(aiData, ['launch_price', 'launchPrice', 'gia_mo_ban']);
      if (launchPrice) newData.launch_price = parseInt(launchPrice);

      // 6. Price Range (Text)
      const priceRange = findValue(aiData, ['price_range', 'priceRange', 'khoang_gia']);
      if (priceRange) newData.price_range = priceRange;

      // 7. Amenities
      const amenities = findValue(aiData, ['amenities', 'tien_ich']);
      if (amenities && Array.isArray(amenities)) {
        const existing = Array.isArray(newData.amenities) ? newData.amenities : [];
        const combined = [...existing, ...amenities];
        const unique = combined.filter((item, index) => 
            combined.findIndex(i => i.toLowerCase() === item.toLowerCase()) === index
        );
        newData.amenities = unique;
      }

      setData(newData);
      setShowScanDialog(false);
      toast.success("Đã áp dụng dữ liệu vào form! Hãy kiểm tra và bấm Lưu.");
      
    } catch (e) {
      toast.error("JSON không hợp lệ. Vui lòng kiểm tra cú pháp.");
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
          <Button variant="secondary" size="sm" onClick={startDeepScan} className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
            <ScanSearch className="w-4 h-4 mr-2" />
            AI Deep Scan
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu thay đổi
        </Button>
      </div>

      {/* Main Form Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 border-b">
          <TabsTrigger value="overview" className="px-6">Tổng quan</TabsTrigger>
          <TabsTrigger value="specs" className="px-6">Thông số & Kỹ thuật</TabsTrigger>
          <TabsTrigger value="financial" className="px-6">Giá & Tài chính</TabsTrigger>
          <TabsTrigger value="legal" className="px-6">Pháp lý</TabsTrigger>
          <TabsTrigger value="amenities" className="px-6">Tiện ích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên dự án</Label>
                  <Input value={data.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Chủ đầu tư</Label>
                  <Input value={data.developer || ''} onChange={(e) => handleChange('developer', e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tỉnh/Thành phố</Label>
                  <Input value={data.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Input value={data.district || ''} onChange={(e) => handleChange('district', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ chi tiết</Label>
                  <Input value={data.location || ''} onChange={(e) => handleChange('location', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả dự án (SEO Description)</Label>
                <Textarea 
                  value={data.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)} 
                  rows={8}
                  className="font-normal leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tổng số căn</Label>
                  <Input type="number" value={data.total_units || ''} onChange={(e) => handleChange('total_units', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số tầng (Floors)</Label>
                  <Input type="number" value={data.floors || ''} onChange={(e) => handleChange('floors', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số Block</Label>
                  <Input type="number" value={data.blocks || ''} onChange={(e) => handleChange('blocks', e.target.value)} /> 
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Diện tích khu đất (m2)</Label>
                  <Input type="number" placeholder="VD: 50000" /> 
                </div>
                 <div className="space-y-2">
                  <Label>Mật độ xây dựng (%)</Label>
                  <Input type="number" value={data.density_construction || ''} onChange={(e) => handleChange('density_construction', e.target.value)} /> 
                </div>
                <div className="space-y-2">
                  <Label>Thời điểm bàn giao</Label>
                  <Input value={data.completion_date || ''} onChange={(e) => handleChange('completion_date', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Loại hình sản phẩm</Label>
                <Input 
                    value={data.apartment_types?.join(', ') || ''} 
                    onChange={(e) => handleChange('apartment_types', e.target.value.split(',').map((s:string) => s.trim()))}
                    placeholder="1PN, 2PN, 3PN, Penthouse"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tiêu chuẩn bàn giao</Label>
                <Input 
                    value={data.handover_standard || ''} 
                    onChange={(e) => handleChange('handover_standard', e.target.value)}
                    placeholder="Hoàn thiện cơ bản, Full nội thất..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
           <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-600 font-semibold">Giá bán hiện tại (VNĐ/m2)</Label>
                  <Input type="number" value={data.current_price || data.price_per_sqm || ''} onChange={(e) => handleChange('current_price', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Giá mở bán (VNĐ/m2)</Label>
                  <Input type="number" value={data.launch_price || ''} onChange={(e) => handleChange('launch_price', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                 <Label>Khoảng giá hiển thị (Text)</Label>
                 <Input value={data.price_range || ''} onChange={(e) => handleChange('price_range', e.target.value)} placeholder="2.5 - 5 tỷ" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
           <Card>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <Label>Điểm pháp lý (Thang 10)</Label>
                    <Input type="number" max={10} value={data.legal_score || ''} onChange={(e) => handleChange('legal_score', e.target.value)} className="w-32" />
                  </div>
                  <div className="space-y-1">
                    <Label>Trạng thái tổng quan</Label>
                     <Select value={data.status || 'warning'} onValueChange={(v) => handleChange('status', v)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Tốt (An toàn)</SelectItem>
                        <SelectItem value="warning">Cảnh báo (Thiếu)</SelectItem>
                        <SelectItem value="danger">Rủi ro cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               
               <div className="space-y-2">
                 <Label>Tình trạng pháp lý chi tiết</Label>
                 <Input 
                    value={data.legal_status || ''} 
                    onChange={(e) => handleChange('legal_status', e.target.value)} 
                    placeholder="Đã có sổ hồng, Đang làm móng, HĐMB..."
                 />
               </div>
            </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="amenities">
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-2">
                        <Label>Danh sách tiện ích (Phân cách bằng dấu phẩy)</Label>
                        <Textarea 
                            value={data.amenities?.join(', ') || ''}
                            onChange={(e) => handleChange('amenities', e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean))}
                            rows={8}
                            placeholder="Hồ bơi, Gym, Công viên, BBQ,..."
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* --- SCAN DIALOG WIZARD --- */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanSearch className="w-5 h-5 text-blue-500" /> 
              AI Deep Scan Wizard
            </DialogTitle>
            <DialogDescription>
              Quy trình quét và trích xuất dữ liệu tự động từ Internet
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-1">
            {scanStep === 'researching' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <div>
                   <h3 className="text-lg font-semibold">Đang tìm kiếm thông tin...</h3>
                   <p className="text-muted-foreground">AI đang đọc các bài báo, brochure và website về dự án.</p>
                </div>
              </div>
            )}

            {scanStep === 'review_text' && (
              <div className="h-full flex flex-col gap-2">
                <Label className="flex items-center gap-2 text-blue-600">
                  <FileText className="w-4 h-4" />
                  Bước 1: Kiểm tra thông tin thô (Bạn có thể sửa nếu thiếu)
                </Label>
                <Textarea 
                  value={researchText} 
                  onChange={(e) => setResearchText(e.target.value)} 
                  className="flex-1 font-mono text-sm leading-relaxed p-4"
                />
              </div>
            )}

            {scanStep === 'structuring' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <div>
                   <h3 className="text-lg font-semibold">Đang cấu trúc dữ liệu...</h3>
                   <p className="text-muted-foreground">AI đang trích xuất các thông số kỹ thuật, giá và tiện ích vào JSON.</p>
                </div>
              </div>
            )}

            {scanStep === 'review_json' && (
              <div className="h-full flex flex-col gap-2">
                <Label className="flex items-center gap-2 text-green-600">
                  <Code className="w-4 h-4" />
                  Bước 2: Sửa JSON (nếu cần)
                </Label>
                <div className="flex-1 border rounded-md bg-slate-50 overflow-hidden relative">
                   <Textarea 
                     value={jsonString}
                     onChange={(e) => setJsonString(e.target.value)}
                     className="w-full h-full font-mono text-xs p-4 resize-none border-0 focus-visible:ring-0 bg-transparent text-slate-800"
                     spellCheck={false}
                   />
                </div>
                <p className="text-xs text-muted-foreground">Bạn có thể sửa trực tiếp JSON ở trên nếu thấy AI trích xuất sai.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            {scanStep === 'review_text' && (
               <Button onClick={processStructure} className="bg-blue-600 hover:bg-blue-700">
                 Tiếp tục (Trích xuất JSON) <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            )}
            {scanStep === 'review_json' && (
               <div className="flex gap-2 w-full justify-end">
                 <Button variant="outline" onClick={() => setScanStep('review_text')}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Làm lại
                 </Button>
                 <Button onClick={applyData} className="bg-green-600 hover:bg-green-700">
                   <Check className="w-4 h-4 mr-2" /> Áp dụng vào Form
                 </Button>
               </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}