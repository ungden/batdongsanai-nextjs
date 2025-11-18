"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  School, 
  Hospital, 
  ShoppingCart,
  Train,
  Bus,
  Plane,
  Building,
  TreePine,
  Utensils,
  Coffee,
  Dumbbell,
  GraduationCap,
  Stethoscope
} from "lucide-react";

interface LocationAnalysisProps {
  projectName: string;
  location: string;
  district: string;
  city: string;
}

const LocationAnalysis = ({ projectName, location, district, city }: LocationAnalysisProps) => {
  // Mock data - in real app, this would come from a location API or database
  const nearbyFacilities = [
    {
      category: "Giáo dục",
      icon: School,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        { name: "Trường THPT Chuyên Lê Hồng Phong", distance: "800m", rating: 4.8 },
        { name: "Đại học Quốc gia", distance: "2.5km", rating: 4.9 },
        { name: "Trường Mầm non Hoa Mai", distance: "500m", rating: 4.7 }
      ]
    },
    {
      category: "Y tế",
      icon: Hospital,
      color: "text-red-600",
      bgColor: "bg-red-50",
      items: [
        { name: "Bệnh viện Đa khoa Quốc tế", distance: "1.2km", rating: 4.6 },
        { name: "Phòng khám Đa khoa Family", distance: "600m", rating: 4.5 },
        { name: "Nhà thuốc 24/7", distance: "300m", rating: 4.8 }
      ]
    },
    {
      category: "Mua sắm",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        { name: "Vincom Center", distance: "1.5km", rating: 4.7 },
        { name: "Siêu thị Co.opMart", distance: "800m", rating: 4.5 },
        { name: "Chợ truyền thống", distance: "1km", rating: 4.3 }
      ]
    },
    {
      category: "Giao thông",
      icon: Train,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      items: [
        { name: "Ga Metro số 1", distance: "1km", rating: 4.8 },
        { name: "Bến xe buýt", distance: "400m", rating: 4.4 },
        { name: "Sân bay Tân Sơn Nhất", distance: "15km", rating: 4.6 }
      ]
    },
    {
      category: "Giải trí",
      icon: Coffee,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
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
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Tốt";
    return "Trung bình";
  };

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
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
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Vị trí dự án</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                {projectName} tọa lạc tại <span className="font-semibold">{location}</span>, 
                một trong những khu vực phát triển năng động nhất của {city}. 
                Vị trí đắc địa với hệ thống giao thông thuận tiện, kết nối nhanh chóng đến các trung tâm quan trọng.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Building className="w-3 h-3 mr-1" />
                  {district}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TreePine className="w-3 h-3 mr-1" />
                  Không gian xanh
                </Badge>
                <Badge variant="outline" className="text-xs">
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
            return (
              <div key={index} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl text-center">
                <IconComponent className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                <div className="text-xs text-slate-600 mb-1">{item.label}</div>
                <div className={`text-lg font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                  {item.score}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nearby Facilities */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Tiện ích xung quanh</h3>
          
          {nearbyFacilities.map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <Card key={index} className={`rounded-xl border ${facility.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${facility.bgColor} rounded-lg border`}>
                      <IconComponent className={`w-5 h-5 ${facility.color}`} />
                    </div>
                    <h4 className="font-semibold text-slate-900">{facility.category}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {facility.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/70 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.distance}</span>
                            <span className="text-amber-600">★ {item.rating}</span>
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
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Dumbbell className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">Chỉ số Walkability</h3>
              <p className="text-sm text-emerald-700 leading-relaxed mb-3">
                Khu vực có chỉ số walkability cao với <span className="font-bold">85/100 điểm</span>. 
                Hầu hết các tiện ích thiết yếu đều nằm trong bán kính đi bộ 15 phút, 
                rất thuận tiện cho cuộc sống hàng ngày.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Đi bộ thuận tiện
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  An toàn giao thông
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Vỉa hè rộng rãi
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Future Development */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">Kế hoạch phát triển khu vực</h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Tuyến Metro số 1 dự kiến hoàn thành vào Q4/2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Trung tâm thương mại mới đang xây dựng (2026)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Công viên công cộng 10ha sẽ khởi công trong năm 2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Mở rộng đường Nguyễn Văn Linh lên 8 làn xe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Investment Potential */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Tiềm năng đầu tư vị trí</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Với điểm vị trí <span className="font-bold">{overallScore}/100</span>, 
                khu vực này được đánh giá là <span className="font-bold">{getScoreLabel(overallScore)}</span> về tiềm năng đầu tư. 
                Hạ tầng hoàn thiện, tiện ích đầy đủ và kế hoạch phát triển rõ ràng 
                tạo nền tảng vững chắc cho sự tăng giá bền vững trong tương lai.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationAnalysis;