"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, TrendingUp, BarChart3, Bell, 
  MessageSquare, Download, Shield, Zap,
  Crown, Star
} from "lucide-react";

const VIPFeatureList = () => {
  const features = [
    {
      category: "Báo cáo & Phân tích",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        { name: "Báo cáo pháp lý chi tiết", vip: "premium" },
        { name: "Phân tích thị trường chuyên sâu", vip: "premium" },
        { name: "Báo cáo tài chính dự án", vip: "premium" },
        { name: "Báo cáo tùy chỉnh theo yêu cầu", vip: "pro" },
        { name: "Phân tích danh mục đầu tư", vip: "pro" }
      ]
    },
    {
      category: "Công cụ & Tính năng",
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      items: [
        { name: "So sánh không giới hạn dự án", vip: "premium" },
        { name: "Tính toán ROI nâng cao", vip: "premium" },
        { name: "Truy cập API dữ liệu", vip: "pro" },
        { name: "Export báo cáo PDF", vip: "premium" },
        { name: "Dashboard cá nhân hóa", vip: "pro" }
      ]
    },
    {
      category: "Cảnh báo & Thông báo",
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      items: [
        { name: "Cảnh báo cơ hội đầu tư", vip: "premium" },
        { name: "Thông báo thay đổi giá", vip: "premium" },
        { name: "Cảnh báo real-time", vip: "pro" },
        { name: "Email tổng hợp hàng tuần", vip: "premium" }
      ]
    },
    {
      category: "Hỗ trợ & Tư vấn",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        { name: "Tư vấn ưu tiên qua email", vip: "premium" },
        { name: "Tư vấn 1-1 với chuyên gia", vip: "pro" },
        { name: "Hỗ trợ ưu tiên 24/7", vip: "pro" },
        { name: "Webinar độc quyền", vip: "pro" }
      ]
    }
  ];

  const getVIPBadge = (vipLevel: string) => {
    if (vipLevel === 'pro') {
      return (
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs px-2 py-0.5 rounded-full">
          <Crown className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs px-2 py-0.5 rounded-full">
        <Star className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((category, index) => (
        <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className={`${category.bgColor} rounded-t-2xl border-b border-slate-200/50 pb-4`}>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className={`p-2 bg-white rounded-xl shadow-sm`}>
                <category.icon className={`w-5 h-5 ${category.color}`} />
              </div>
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl hover:shadow-md transition-all">
                <span className="text-sm text-slate-700 font-medium">{item.name}</span>
                {getVIPBadge(item.vip)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VIPFeatureList;