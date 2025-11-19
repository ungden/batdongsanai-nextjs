"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  School, 
  Hospital, 
  ShoppingCart,
  Train,
  Building,
  TreePine,
  Coffee,
  Dumbbell,
  GraduationCap,
  Stethoscope,
  Star
} from "lucide-react";

interface LocationAnalysisProps {
  projectName: string;
  location: string;
  district: string;
  city: string;
}

const LocationAnalysis = ({ projectName, location, district, city }: LocationAnalysisProps) => {
  const nearbyFacilities = [
    {
      category: "Giáo dục",
      icon: School,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-100 dark:border-blue-900/50",
      items: [
        { name: "Trường THPT Chuyên Lê Hồng Phong", distance: "800m", rating: 4.8 },
        { name: "Đại học Quốc gia", distance: "2.5km", rating: 4.9 },
        { name: "Trường Mầm non Hoa Mai", distance: "500m", rating: 4.7 }
      ]
    },
    {
      category: "Y tế",
      icon: Hospital,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-100 dark:border-red-900/50",
      items: [
        { name: "Bệnh viện Đa khoa Quốc tế", distance: "1.2km", rating: 4.6 },
        { name: "Phòng khám Đa khoa Family", distance: "600m", rating: 4.5 },
        { name: "Nhà thuốc 24/7", distance: "300m", rating: 4.8 }
      ]
    },
    {
      category: "Mua sắm",
      icon: ShoppingCart,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-100 dark:border-purple-900/50",
      items: [
        { name: "Vincom Center", distance: "1.5km", rating: 4.7 },
        { name: "Siêu thị Co.opMart", distance: "800m", rating: 4.5 },
        { name: "Chợ truyền thống", distance: "1km", rating: 4.3 }
      ]
    },
    {
      category: "Giao thông",
      icon: Train,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
      items: [
        { name: "Ga Metro số 1", distance: "1km", rating: 4.8 },
        { name: "Bến xe buýt", distance: "400m", rating: 4.4 },
        { name: "Sân bay Tân Sơn Nhất", distance: "15km", rating: 4.6 }
      ]
    },
    {
      category: "Giải trí",
      icon: Coffee,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-100 dark:border-amber-900/50",
      items: [
        { name: "Công viên Gia Định", distance: "2km", rating: 4.7 },
        { name: "Rạp chiếu phim CGV", distance: "1.5km", rating: 4.6 },
        { name: "Khu ẩm thực", distance: "800m", rating: 4.5 }
      ]
    }
  ];

  const transportationScore = 85;
  const educationScore = 90;
  const healthcareScore = 80;
  const shoppingScore = 88;
  const entertainmentScore = 75;

  const overallScore = Math.round(
    (transportationScore + educationScore + healthcareScore + shoppingScore + entertainmentScore) / 5
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Tốt";
    return "Trung bình";
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-t-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            Phân tích vị trí & Hạ tầng
          </CardTitle>
          <Badge className={`${getScoreColor(overallScore)} border px-3 py-1 font-bold`}>
            Điểm: {overallScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Location Overview */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-background rounded-xl shadow-sm text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Vị trí dự án</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {projectName} tọa lạc tại <span className="font-semibold text-foreground">{location}</span>, 
                một trong những khu vực phát triển năng động nhất của {city}. 
                Vị trí đắc địa với hệ thống giao thông thuận tiện, kết nối nhanh chóng đến các trung tâm quan trọng.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-background/50">
                  <Building className="w-3 h-3 mr-1" />
                  {district}
                </Badge>
                <Badge variant="outline" className="text-xs bg-background/50">
                  <TreePine className="w-3 h-3 mr-1" />
                  Không gian xanh
                </Badge>
                <Badge variant="outline" className="text-xs bg-background/50">
                  <Train className="w-3 h-3 mr-1" />
                  Gần Metro
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Giao thông", score: transportationScore, icon: Train },
            { label: "Giáo dục", score: educationScore, icon: GraduationCap },
            { label: "Y tế", score: healthcareScore, icon: Stethoscope },
            { label: "Mua sắm", score: shoppingScore, icon: ShoppingCart },
            { label: "Giải trí", score: entertainmentScore, icon: Coffee }
          ].map((item, index) => {
            const IconComponent = item.icon;
            const scoreClass = getScoreColor(item.score).split(' ')[0]; // Extract text color class
            return (
              <div key={index} className="p-3 bg-muted/30 rounded-xl text-center border border-border/50">
                <IconComponent className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className={`text-lg font-bold ${scoreClass}`}>
                  {item.score}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nearby Facilities */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Tiện ích xung quanh</h3>
          
          {nearbyFacilities.map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <Card key={index} className={`rounded-xl border ${facility.borderColor} ${facility.bgColor} shadow-none`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-background/60 border border-border/50`}>
                      <IconComponent className={`w-5 h-5 ${facility.color}`} />
                    </div>
                    <h4 className="font-semibold text-foreground">{facility.category}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {facility.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-background/60 rounded-lg border border-border/30">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.distance}</span>
                            <span className="text-amber-500 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current" /> {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Walkability Score */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-background rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Chỉ số Walkability</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed mb-3">
                Khu vực có chỉ số walkability cao với <span className="font-bold">85/100 điểm</span>. 
                Hầu hết các tiện ích thiết yếu đều nằm trong bán kính đi bộ 15 phút, 
                rất thuận tiện cho cuộc sống hàng ngày.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  Đi bộ thuận tiện
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  An toàn giao thông
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Future Development */}
        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-900/50">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-background rounded-xl shadow-sm text-purple-600 dark:text-purple-400">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Kế hoạch phát triển khu vực</h3>
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Tuyến Metro số 1 dự kiến hoàn thành vào Q4/2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Trung tâm thương mại mới đang xây dựng (2026)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Mở rộng đường Nguyễn Văn Linh lên 8 làn xe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationAnalysis;