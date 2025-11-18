"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  MapPin, 
  Building2,
  Users,
  Award,
  Zap,
  Target,
  CheckCircle,
  Star
} from "lucide-react";

interface InvestmentHighlightsProps {
  projectName: string;
  legalScore: number;
  developer: string;
  location: string;
  rentalYield?: number;
  completionDate: string;
}

const InvestmentHighlights = ({ 
  projectName, 
  legalScore, 
  developer,
  location,
  rentalYield,
  completionDate
}: InvestmentHighlightsProps) => {
  
  // Calculate highlight scores
  const highlights = [
    {
      icon: Shield,
      title: "Pháp lý minh bạch",
      description: `Điểm pháp lý ${legalScore}/10 - Giấy tờ đầy đủ, rõ ràng`,
      score: legalScore * 10,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Building2,
      title: "Chủ đầu tư uy tín",
      description: `${developer} - Thương hiệu hàng đầu thị trường`,
      score: 90,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: MapPin,
      title: "Vị trí đắc địa",
      description: `${location} - Khu vực phát triển mạnh`,
      score: 85,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    {
      icon: TrendingUp,
      title: "Tiềm năng tăng giá",
      description: rentalYield ? `ROI ${rentalYield}%/năm - Triển vọng tốt` : "Triển vọng tăng giá tốt",
      score: rentalYield ? rentalYield * 15 : 75,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    {
      icon: Users,
      title: "Cộng đồng dân cư",
      description: "Môi trường sống văn minh, hiện đại",
      score: 80,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
    {
      icon: Award,
      title: "Chất lượng xây dựng",
      description: "Tiêu chuẩn quốc tế, vật liệu cao cấp",
      score: 88,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200"
    }
  ];

  const keyStrengths = [
    {
      icon: Zap,
      title: "Thanh khoản cao",
      description: "Dễ dàng mua bán, chuyển nhượng"
    },
    {
      icon: Target,
      title: "Phù hợp đa mục đích",
      description: "Ở, cho thuê hoặc đầu tư đều tốt"
    },
    {
      icon: CheckCircle,
      title: "Hạ tầng hoàn thiện",
      description: "Tiện ích đầy đủ, giao thông thuận lợi"
    },
    {
      icon: Star,
      title: "Giá trị bền vững",
      description: "Tăng trưởng ổn định theo thời gian"
    }
  ];

  const overallScore = Math.round(
    highlights.reduce((sum, h) => sum + h.score, 0) / highlights.length
  );

  const getScoreLabel = (score: number) => {
    if (score >= 85) return { label: "Xuất sắc", color: "text-emerald-600", bgColor: "bg-emerald-50" };
    if (score >= 70) return { label: "Tốt", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (score >= 60) return { label: "Khá", color: "text-amber-600", bgColor: "bg-amber-50" };
    return { label: "Trung bình", color: "text-slate-600", bgColor: "bg-slate-50" };
  };

  const scoreLabel = getScoreLabel(overallScore);

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Điểm nổi bật đầu tư
          </CardTitle>
          <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color} border px-3 py-1 font-bold`}>
            {scoreLabel.label} - {overallScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Assessment */}
        <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 rounded-2xl border-2 border-blue-200">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-3 shadow-lg">
              <span className="text-3xl font-black">{overallScore}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Đánh giá tổng thể: {scoreLabel.label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {projectName} đạt điểm <span className="font-bold">{overallScore}/100</span> về tiềm năng đầu tư.
              {overallScore >= 85 && " Đây là một lựa chọn xuất sắc cho cả mục đích ở và đầu tư."}
              {overallScore >= 70 && overallScore < 85 && " Dự án có nhiều điểm mạnh đáng chú ý."}
              {overallScore < 70 && " Nên xem xét kỹ các yếu tố trước khi quyết định."}
            </p>
          </div>
        </div>

        {/* Detailed Highlights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Phân tích chi tiết</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => {
              const IconComponent = highlight.icon;
              return (
                <Card key={index} className={`rounded-xl border ${highlight.borderColor} ${highlight.bgColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 bg-white rounded-xl shadow-sm border ${highlight.borderColor}`}>
                        <IconComponent className={`w-6 h-6 ${highlight.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{highlight.title}</h4>
                          <Badge className={`${highlight.bgColor} ${highlight.color} border ${highlight.borderColor} text-xs`}>
                            {highlight.score}/100
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Strengths */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Điểm mạnh nổi bật</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyStrengths.map((strength, index) => {
              const IconComponent = strength.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl hover:shadow-md transition-all">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{strength.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{strength.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investment Recommendation */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">Khuyến nghị đầu tư</h3>
              <div className="text-sm text-emerald-700 leading-relaxed space-y-2">
                {overallScore >= 85 && (
                  <>
                    <p className="font-semibold">✓ Đây là cơ hội đầu tư xuất sắc!</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Pháp lý rõ ràng, an toàn cao</li>
                      <li>Vị trí đắc địa, tiềm năng tăng giá tốt</li>
                      <li>Chủ đầu tư uy tín, đảm bảo chất lượng</li>
                      <li>Phù hợp cho cả đầu tư ngắn và dài hạn</li>
                    </ul>
                  </>
                )}
                {overallScore >= 70 && overallScore < 85 && (
                  <>
                    <p className="font-semibold">✓ Dự án đáng cân nhắc</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Có nhiều điểm mạnh nổi bật</li>
                      <li>Nên xem xét kỹ các yếu tố rủi ro</li>
                      <li>Phù hợp cho nhà đầu tư có kinh nghiệm</li>
                      <li>Cân nhắc mục đích đầu tư cụ thể</li>
                    </ul>
                  </>
                )}
                {overallScore < 70 && (
                  <>
                    <p className="font-semibold">⚠ Cần xem xét kỹ lưỡng</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Nghiên cứu kỹ các điểm yếu</li>
                      <li>Tham khảo ý kiến chuyên gia</li>
                      <li>Chuẩn bị phương án dự phòng</li>
                      <li>Chỉ đầu tư nếu hiểu rõ rủi ro</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Note */}
        {completionDate !== "Đã hoàn thành" && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Lưu ý về thời gian</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Dự án dự kiến hoàn thành vào <span className="font-bold">{completionDate}</span>.
                  Đầu tư vào giai đoạn này có thể hưởng lợi từ chênh lệch giá khi dự án hoàn thành,
                  nhưng cũng cần lưu ý rủi ro về tiến độ thi công.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentHighlights;