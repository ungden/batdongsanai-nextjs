"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, FileText, Zap, Edit, Eye, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';

export default function ApprovalCenter() {
  const [activeTab, setActiveTab] = useState("content");
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [pendingCatalysts, setPendingCatalysts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Preview State
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [previewType, setPreviewType] = useState<"content" | "catalyst">("content");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Draft Content (News/Blogs created by Content Studio)
      const { data: contentData } = await supabase
        .from('content_items')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });
      
      setPendingContent(contentData || []);

      // 2. Fetch Pending Catalysts (Created by Catalyst Factory)
      // Note: Assuming verification_status column exists, otherwise we simulate
      const { data: catalystData } = await supabase
        .from('market_catalysts' as any)
        .select('*')
        .eq('verification_status', 'pending') 
        .order('created_at', { ascending: false });
      
      setPendingCatalysts(catalystData || []);

    } catch (error) {
      console.error("Error fetching pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, type: "content" | "catalyst") => {
    try {
      if (type === "content") {
        const { error } = await supabase
          .from('content_items')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('market_catalysts' as any)
          .update({ verification_status: 'verified' }) // Chuyển sang đã xác thực
          .eq('id', id);
        if (error) throw error;
      }

      toast.success("Đã duyệt thành công! Nội dung đã public.");
      setPreviewItem(null);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleReject = async (id: string, type: "content" | "catalyst") => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mục này?")) return;
    
    try {
      const table = type === "content" ? "content_items" : "market_catalysts";
      const { error } = await supabase.from(table as any).delete().eq('id', id);
      
      if (error) throw error;
      toast.success("Đã từ chối và xóa mục này.");
      setPreviewItem(null);
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trung tâm Kiểm duyệt</h1>
        <p className="text-muted-foreground">Nơi phê duyệt dữ liệu từ AI trước khi hiển thị ra Website</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-orange-800 font-medium">Bài viết nháp</p>
              <h3 className="text-2xl font-bold text-orange-900">{pendingContent.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Catalyst chờ duyệt</p>
              <h3 className="text-2xl font-bold text-blue-900">{pendingCatalysts.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="content">
            Nội dung / Bài viết
            {pendingContent.length > 0 && <Badge variant="secondary" className="ml-2 bg-orange-200 text-orange-800">{pendingContent.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="catalysts">
            Dữ liệu thị trường
            {pendingCatalysts.length > 0 && <Badge variant="secondary" className="ml-2 bg-blue-200 text-blue-800">{pendingCatalysts.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="space-y-4 mt-4">
          {pendingContent.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
              <p className="text-muted-foreground">Tuyệt vời! Không có bài viết nào cần duyệt.</p>
            </div>
          ) : (
            pendingContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                <CardContent className="p-6 flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Bản nháp</Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.meta_description || item.content?.substring(0, 150)}...</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => { setPreviewItem(item); setPreviewType("content"); }}>
                      <Eye className="w-4 h-4 mr-2" /> Xem
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleApprove(item.id, "content")}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Duyệt
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReject(item.id, "content")}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CATALYSTS TAB */}
        <TabsContent value="catalysts" className="space-y-4 mt-4">
          {pendingCatalysts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
              <p className="text-muted-foreground">Không có dữ liệu thị trường mới cần duyệt.</p>
            </div>
          ) : (
            pendingCatalysts.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-400">
                <CardContent className="p-6 flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Mới từ AI</Badge>
                      <Badge variant="outline">{item.catalyst_type}</Badge>
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2">
                      <div><span className="text-muted-foreground">Tác động:</span> <strong>{item.impact_level} ({item.impact_direction})</strong></div>
                      <div><span className="text-muted-foreground">Dự báo giá:</span> <strong className={item.estimated_price_impact_percent > 0 ? 'text-green-600' : 'text-red-600'}>{item.estimated_price_impact_percent}%</strong></div>
                      <div><span className="text-muted-foreground">Khu vực:</span> {item.affected_areas?.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => { setPreviewItem(item); setPreviewType("catalyst"); }}>
                      <Eye className="w-4 h-4 mr-2" /> Xem
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleApprove(item.id, "catalyst")}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Duyệt
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReject(item.id, "catalyst")}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước: {previewItem?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {previewType === "content" && previewItem && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{previewItem.content}</ReactMarkdown>
              </div>
            )}

            {previewType === "catalyst" && previewItem && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Mô tả chi tiết</h4>
                  <p>{previewItem.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <span className="text-xs text-muted-foreground">Loại</span>
                     <p className="font-medium">{previewItem.catalyst_type}</p>
                   </div>
                   <div className="space-y-1">
                     <span className="text-xs text-muted-foreground">Ngày hiệu lực</span>
                     <p className="font-medium">{previewItem.effective_date || "Chưa xác định"}</p>
                   </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setPreviewItem(null)}>Đóng</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(previewItem.id, previewType)}>
                <CheckCircle className="w-4 h-4 mr-2" /> Duyệt & Public ngay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}