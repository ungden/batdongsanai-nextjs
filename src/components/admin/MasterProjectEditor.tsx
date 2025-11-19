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

// Helper to map flat JSON keys to our DB structure
const mapAiDataToFields = (aiData: any, section: string, currentData: any) => {
  const newData = { ...currentData };
  
  const find = (keys: string[]) => {
    for (const k of keys) {
      // Check root
      if (aiData[k] !== undefined && aiData[k] !== null) return aiData[k];
      // Check nested common keys
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
    const dev = find(['developer']);
    if (dev) newData.developer = dev;
    const loc = find(['location']);
    if (loc) newData.location = loc;
    const city = find(['city']);
    if (city) newData.city = city;
    const dist = find(['district']);
    if (dist) newData.district = dist;
  }

  if (section === 'specs') {
    const units = find(['total_units', 'totalUnits']);
    if (units) newData.total_units = typeof units === 'string' ? parseInt(units.replace(/\D/g, '')) : units;
    
    const floors = find(['total_floors', 'floors']);
    if (floors) newData.floors = typeof floors === 'string' ? parseInt(floors.replace(/\D/g, '')) : floors;
    
    const types = find(['apartment_types']);
    if (types && Array.isArray(types)) newData.apartment_types = types;
    
    const handover = find(['handover_standard']);
    if (handover) newData.handover_standard = handover;
  }

  if (section === 'financial') {
    const price = find(['price_per_sqm', 'current_price']);
    if (price) newData.price_per_sqm = typeof price === 'string' ? parseInt(price.replace(/\D/g, '')) : price;
    
    const launch = find(['launch_price']);
    if (launch) newData.launch_price = typeof launch === 'string' ? parseInt(launch.replace(/\D/g, '')) : launch;
    
    const range = find(['price_range']);
    if (range) newData.price_range = range;
  }

  if (section === 'legal') {
    const status = find(['legal_status']);
    if (status) newData.legal_status = status;
    
    const date = find(['completion_date']);
    if (date) newData.completion_date = date;
  }

  if (section === 'amenities') {
    const amenities = find(['amenities', 'tien_ich']);
    if (amenities && Array.isArray(amenities)) {
      // Merge unique
      const existing = Array.isArray(newData.amenities) ? newData.amenities : [];
      const combined = [...existing, ...amenities];
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
      // 1. Research
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
      
      setProgress(((i + 1) / sections.length) * 100);
    }

    setAuditStatus('completed');
    setTimeout(() => setAuditStatus('idle'), 3000);
    toast.success("Đã hoàn thành Audit toàn diện!");
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
          
          {auditStatus === 'running' ? (
             <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
               <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
               <span className="text-xs font-medium text-blue-700">AI đang làm việc: {currentStep}</span>
               <Progress value={progress} className="w-24 h-2" />
             </div>
          ) : (
             <Button 
               variant="secondary" 
               size="sm" 
               onClick={runFullAudit} 
               className="border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
             >
               <Sparkles className="w-4 h-4 mr-2" />
               Chạy Full Audit (AI)
             </Button>
          )}
        </div>
        <Button onClick={() => handleSave()} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md">
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
        <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 border-b">
          <TabsTrigger value="overview" className="px-6">Tổng quan</TabsTrigger>
          <TabsTrigger value="specs" className="px-6">Thông số</TabsTrigger>
          <TabsTrigger value="financial" className="px-6">Giá & TC</TabsTrigger>
          <TabsTrigger value="legal" className="px-6">Pháp lý</TabsTrigger>
          <TabsTrigger value="amenities" className="px-6">Tiện ích</TabsTrigger>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tổng số căn</Label>
                  <Input type="number" value={data.total_units || ''} onChange={(e) => handleChange('total_units', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số tầng</Label>
                  <Input type="number" value={data.floors || ''} onChange={(e) => handleChange('floors', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số Block</Label>
                  <Input type="number" value={data.blocks || ''} onChange={(e) => handleChange('blocks', e.target.value)} />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-600 font-bold">Giá bán hiện tại (VNĐ/m2)</Label>
                  <Input type="number" value={data.price_per_sqm || ''} onChange={(e) => handleChange('price_per_sqm', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Giá mở bán (VNĐ/m2)</Label>
                  <Input type="number" value={data.launch_price || ''} onChange={(e) => handleChange('launch_price', e.target.value)} />
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
                    <Input type="number" max={10} value={data.legal_score || ''} onChange={(e) => handleChange('legal_score', e.target.value)} />
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