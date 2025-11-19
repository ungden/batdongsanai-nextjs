"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, ScanSearch, RefreshCw } from "lucide-react";

interface MasterEditorProps {
  projectId: string;
  onSave?: () => void;
}

export default function MasterProjectEditor({ projectId, onSave }: MasterEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState<any>({});

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

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', projectId);

    if (error) {
      toast.error("Lỗi lưu dữ liệu: " + error.message);
    } else {
      toast.success("Đã cập nhật thông tin dự án");
      if (onSave) onSave();
    }
    setSaving(false);
  };

  const handleDeepScan = async () => {
    setScanning(true);
    try {
      // STEP 1: Research (Text Report)
      const { data: resData, error: resError } = await supabase.functions.invoke('research-project', {
        body: { query: data.name, mode: 'deep_scan' }
      });

      if (resError) throw resError;
      const reportText = resData.data;

      // STEP 2: Structure (JSON)
      const { data: structData, error: structError } = await supabase.functions.invoke('structure-data', {
        body: { content: reportText, type: 'project_detail' }
      });

      if (structError) throw structError;
      const aiData = structData.data;
      
      // Merge AI data into form
      const newData = { ...data };
      
      if (aiData.overview?.description && !newData.description) newData.description = aiData.overview.description;
      if (aiData.specs?.total_units && !newData.total_units) newData.total_units = aiData.specs.total_units;
      if (aiData.specs?.total_floors && !newData.floors) newData.floors = aiData.specs.total_floors;
      if (aiData.pricing?.price_per_sqm && !newData.price_per_sqm) newData.price_per_sqm = aiData.pricing.price_per_sqm;
      if (aiData.amenities) newData.amenities = Array.from(new Set([...(newData.amenities || []), ...aiData.amenities]));

      setData(newData);
      toast.success("Đã quét xong! Dữ liệu mới đã được điền vào form.");
      
    } catch (error: any) {
      toast.error("Lỗi Deep Scan: " + error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{data.name}</h2>
          <Button variant="outline" size="sm" onClick={handleDeepScan} disabled={scanning} className="border-blue-500 text-blue-600 hover:bg-blue-50">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanSearch className="w-4 h-4 mr-2" />}
            AI Deep Scan (Tự điền)
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu thay đổi
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="px-6">Tổng quan</TabsTrigger>
          <TabsTrigger value="specs" className="px-6">Thông số & Kỹ thuật</TabsTrigger>
          <TabsTrigger value="financial" className="px-6">Giá & Tài chính</TabsTrigger>
          <TabsTrigger value="legal" className="px-6">Pháp lý</TabsTrigger>
          <TabsTrigger value="amenities" className="px-6">Tiện ích</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
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
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SPECS */}
        <TabsContent value="specs">
          <Card>
            <CardContent className="p-6 space-y-4">
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
                  <Label>Số block</Label>
                  <Input placeholder="VD: 5" /> 
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Diện tích khu đất (m2)</Label>
                  <Input type="number" placeholder="VD: 50000" /> 
                </div>
                 <div className="space-y-2">
                  <Label>Mật độ xây dựng (%)</Label>
                  <Input type="number" placeholder="VD: 35" /> 
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FINANCIAL */}
        <TabsContent value="financial">
           <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá bán hiện tại (VNĐ/m2)</Label>
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

        {/* TAB 4: LEGAL */}
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
            </CardContent>
           </Card>
        </TabsContent>

        {/* TAB 5: AMENITIES */}
        <TabsContent value="amenities">
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-2">
                        <Label>Danh sách tiện ích</Label>
                        <Textarea 
                            value={data.amenities?.join(', ') || ''}
                            onChange={(e) => handleChange('amenities', e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean))}
                            rows={5}
                            placeholder="Hồ bơi, Gym, Công viên, BBQ,..."
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}