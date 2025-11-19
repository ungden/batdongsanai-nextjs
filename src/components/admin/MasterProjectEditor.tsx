"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, ScanSearch, Sparkles, Play, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MasterEditorProps {
  projectId: string;
  onSave?: () => void;
}

// Helper an toàn để parse số, tránh NaN
const safeParseInt = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  
  // Xử lý string: "5000 căn", "30.5"
  const str = String(val).replace(/,/g, ''); // Xóa dấu phẩy
  const num = parseInt(str.replace(/\D/g, '')); // Chỉ lấy số
  return isNaN(num) ? null : num;
};

const safeParseFloat = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const match = String(val).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : null;
}

// Helper to map flat JSON keys to our DB structure
const mapAiDataToFields = (aiData: any, section: string, currentData: any) => {
  const newData = { ...currentData };
  
  // Hàm tìm kiếm linh hoạt trong JSON AI trả về
  const find = (keys: string[]) => {
    for (const k of keys) {
      if (aiData[k] !== undefined && aiData[k] !== null) return aiData[k];
      if (aiData.overview?.[k]) return aiData.overview[k];
      if (aiData.specs?.[k]) return aiData.specs[k];
      if (aiData.pricing?.[k]) return aiData.pricing[k];
      if (aiData.legal?.[k]) return aiData.legal[k];
    }
    return undefined;
  };

  if (section === 'overview') {
    const desc = find(['description', 'summary']);
    if (desc) newData.description = desc;
    const dev = find(['developer', 'chu_dau_tu']);
    if (dev) newData.developer = dev;
    const loc = find(['location', 'dia_chi']);
    if (loc) newData.location = loc;
    const city = find(['city', 'thanh_pho']);
    if (city) newData.city = city;
    const dist = find(['district', 'quan_huyen']);
    if (dist) newData.district = dist;
  }

  if (section === 'specs') {
    const units = find(['total_units', 'totalUnits', 'so_can_ho']);
    if (units) newData.total_units = safeParseInt(units);
    
    const floors = find(['total_floors', 'floors', 'so_tang']);
    if (floors) newData.floors = safeParseInt(floors);

    const blocks = find(['blocks', 'so_block']);
    if (blocks) newData.blocks = safeParseInt(blocks);
    
    const types = find(['apartment_types']);
    if (types && Array.isArray(types)) newData.apartment_types = types;
    
    const handover = find(['handover_standard']);
    if (handover) newData.handover_standard = handover;
  }

  if (section === 'financial') {
    const price = find(['price_per_sqm', 'current_price']);
    if (price) newData.price_per_sqm = safeParseInt(price);
    
    const launch = find(['launch_price']);
    if (launch) newData.launch_price = safeParseInt(launch);
    
    const range = find(['price_range']);
    if (range) newData.price_range = range;
  }

  if (section === 'legal') {
    const status = find(['legal_status']);
    if (status) newData.legal_status = status;
    
    const date = find(['completion_date']);
    if (date) newData.completion_date = date;

    // Logic tự động chấm điểm pháp lý đơn giản
    if (newData.legal_status?.toLowerCase().includes('sổ') || newData.legal_status?.toLowerCase().includes('hđmb')) {
       if (!newData.legal_score) newData.legal_score = 8;
    }
  }

  if (section === 'amenities') {
    const amenities = find(['amenities', 'tien_ich']);
    if (amenities && Array.isArray(amenities)) {
      const existing = Array.isArray(newData.amenities) ? newData.amenities : [];
      const combined = [...existing, ...amenities];
      // Deduplicate
      newData.amenities = [...new Set(combined)];
    }
  }

  return newData;
};

export default function MasterProjectEditor({ projectId, onSave }: MasterEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({});
  
  // Audit State
  const [auditStatus, setAuditStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const { data: p, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (error) toast.error("Không tải được dữ liệu dự án");
    else setData(p || {});
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      const { error } = await supabase.from('projects').update(data).eq('id', projectId);
      if (error) throw error;
      if (!silent) toast.success("Đã lưu dữ liệu");
      if (onSave) onSave();
    } catch (error: any) {
      if (!silent) toast.error("Lỗi lưu: " + error.message);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // --- SECTION SCAN LOGIC ---
  const runScanForSection = async (section: string, isAuto = false) => {
    if (!isAuto) setAuditStatus('running');
    
    try {
      // 1. Research (Deep Scan)
      const { data: resData, error: resError } = await supabase.functions.invoke('research-project', {
        body: { query: data.name, mode: 'deep_scan', section }
      });
      if (resError) throw resError;
      
      // 2. Structure to JSON
      const { data: structData, error: structError } = await supabase.functions.invoke('structure-data', {
        body: { content: resData.data, type: 'project_detail' }
      });
      if (structError) throw structError;

      // 3. Apply & Save
      const newData = mapAiDataToFields(structData.data, section, data);
      setData(newData);
      
      // Auto save to DB to persist progress
      await supabase.from('projects').update(newData).eq('id', projectId);

      if (!isAuto) {
        setAuditStatus('idle');
        toast.success(`Đã cập nhật dữ liệu phần: ${section}`);
      }
      return true;
    } catch (error: any) {
      console.error(`Error scanning ${section}:`, error);
      if (!isAuto) {
        setAuditStatus('idle');
        toast.error(`Lỗi quét phần ${section}: ${error.message}`);
      }
      return false;
    }
  };

  // --- FULL AUTO AUDIT ---
  const runFullAudit = async () => {
    if (!data.name) return toast.error("Chưa có tên dự án");
    
    setAuditStatus('running');
    setLogs([]);
    setProgress(0);

    const sections = [
      { id: 'overview', label: 'Tổng quan & Vị trí' },
      { id: 'specs', label: 'Thông số kỹ thuật' },
      { id: 'financial', label: 'Giá & Tài chính' },
      { id: 'legal', label: 'Pháp lý & Tiến độ' },
      { id: 'amenities', label: 'Tiện ích' }
    ];

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      setCurrentStep(sec.label);
      setLogs(prev => [...prev, `⏳ Đang quét: ${sec.label}...`]);
      
      const success = await runScanForSection(sec.id, true);
      
      if (success) {
        setLogs(prev => {
          const newLogs = [...prev];
          newLogs[newLogs.length - 1] = `✅ Hoàn tất: ${sec.label}`;
          return newLogs;
        });
      } else {
        setLogs(prev => [...prev, `❌ Thất bại: ${sec.label}`]);
      }
      
      // Delay nhẹ để tránh rate limit
      await new Promise(r => setTimeout(r, 1000));
      
      setProgress(Math.round(((i + 1) / sections.length) * 100));
    }

    setAuditStatus('completed');
    setTimeout(() => setAuditStatus('idle'), 3000);
    toast.success("Đã hoàn thành Audit toàn diện!");
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-card p-4 rounded-lg border shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl font-bold text-foreground truncate max-w-[200px]">{data.name}</h2>
          
          {auditStatus === 'running' ? (
             <div className="flex flex-1 md:flex-none items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
               <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
               <div className="flex flex-col w-full md:w-auto">
                 <span className="text-xs font-medium text-blue-700 whitespace-nowrap">AI đang làm việc: {currentStep}</span>
                 <Progress value={progress} className="w-24 h-1.5 mt-1" />
               </div>
             </div>
          ) : (
             <Button 
               variant="secondary" 
               size="sm" 
               onClick={runFullAudit} 
               className="border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 w-full md:w-auto"
             >
               <Sparkles className="w-4 h-4 mr-2" />
               Chạy Full Audit (AI)
             </Button>
          )}
        </div>
        <Button onClick={() => handleSave()} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md w-full md:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu thủ công
        </Button>
      </div>

      {/* Logs Area (Only show when running) */}
      {auditStatus !== 'idle' && (
        <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-xs space-y-1 max-h-32 overflow-y-auto shadow-inner">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}

      {/* Tabs Form */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 border-b overflow-x-auto">
          <TabsTrigger value="overview" className="px-4 py-2">Tổng quan</TabsTrigger>
          <TabsTrigger value="specs" className="px-4 py-2">Thông số</TabsTrigger>
          <TabsTrigger value="financial" className="px-4 py-2">Giá & TC</TabsTrigger>
          <TabsTrigger value="legal" className="px-4 py-2">Pháp lý</TabsTrigger>
          <TabsTrigger value="amenities" className="px-4 py-2">Tiện ích</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={() => runScanForSection('overview')} disabled={auditStatus === 'running'}>
                    <ScanSearch className="w-3 h-3 mr-2" /> Scan lại mục này
                 </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên dự án</Label>
                  <Input value={data.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Chủ đầu tư</Label>
                  <Input value={data.developer || ''} onChange={(e) => handleChange('developer', e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
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
                <Textarea value={data.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={6} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPECS TAB */}
        <TabsContent value="specs">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={() => runScanForSection('specs')} disabled={auditStatus === 'running'}>
                    <ScanSearch className="w-3 h-3 mr-2" /> Scan lại mục này
                 </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tổng số căn</Label>
                  <Input type="number" value={data.total_units || ''} onChange={(e) => handleChange('total_units', safeParseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Số tầng</Label>
                  <Input type="number" value={data.floors || ''} onChange={(e) => handleChange('floors', safeParseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Số Block</Label>
                  <Input type="number" value={data.blocks || ''} onChange={(e) => handleChange('blocks', safeParseInt(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Loại hình căn hộ</Label>
                <Input value={data.apartment_types?.join(', ') || ''} onChange={(e) => handleChange('apartment_types', e.target.value.split(',').map((s:string) => s.trim()))} />
              </div>
              <div className="space-y-2">
                <Label>Tiêu chuẩn bàn giao</Label>
                <Input value={data.handover_standard || ''} onChange={(e) => handleChange('handover_standard', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCIAL TAB */}
        <TabsContent value="financial">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={() => runScanForSection('financial')} disabled={auditStatus === 'running'}>
                    <ScanSearch className="w-3 h-3 mr-2" /> Scan lại mục này
                 </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-600 font-bold">Giá bán hiện tại (VNĐ/m2)</Label>
                  <Input type="number" value={data.price_per_sqm || ''} onChange={(e) => handleChange('price_per_sqm', safeParseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Giá mở bán (VNĐ/m2)</Label>
                  <Input type="number" value={data.launch_price || ''} onChange={(e) => handleChange('launch_price', safeParseInt(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                 <Label>Khoảng giá hiển thị (Text)</Label>
                 <Input value={data.price_range || ''} onChange={(e) => handleChange('price_range', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEGAL TAB */}
        <TabsContent value="legal">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={() => runScanForSection('legal')} disabled={auditStatus === 'running'}>
                    <ScanSearch className="w-3 h-3 mr-2" /> Scan lại mục này
                 </Button>
              </div>
              <div className="flex items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <Label>Điểm pháp lý (0-10)</Label>
                    <Input type="number" max={10} value={data.legal_score || ''} onChange={(e) => handleChange('legal_score', safeParseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Trạng thái</Label>
                    <Select value={data.status || 'warning'} onValueChange={(v) => handleChange('status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Tốt</SelectItem>
                        <SelectItem value="warning">Cảnh báo</SelectItem>
                        <SelectItem value="danger">Rủi ro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="space-y-2">
                 <Label>Chi tiết pháp lý</Label>
                 <Input value={data.legal_status || ''} onChange={(e) => handleChange('legal_status', e.target.value)} />
              </div>
               <div className="space-y-2">
                 <Label>Thời gian bàn giao</Label>
                 <Input value={data.completion_date || ''} onChange={(e) => handleChange('completion_date', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AMENITIES TAB */}
        <TabsContent value="amenities">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-end">
                 <Button variant="ghost" size="sm" onClick={() => runScanForSection('amenities')} disabled={auditStatus === 'running'}>
                    <ScanSearch className="w-3 h-3 mr-2" /> Scan lại mục này
                 </Button>
              </div>
              <div className="space-y-2">
                  <Label>Danh sách tiện ích</Label>
                  <Textarea 
                      value={data.amenities?.join(', ') || ''}
                      onChange={(e) => handleChange('amenities', e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean))}
                      rows={8}
                      placeholder="Hồ bơi, Gym..."
                  />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}