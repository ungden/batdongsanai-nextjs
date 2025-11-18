"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown,
  DollarSign,
  FileText,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface RiskAnalysisProps {
  project: Project;
}

const RiskAnalysis = ({ project }: RiskAnalysisProps) => {
  // Calculate risk scores for different categories
  const legalRisk = calculateLegalRisk(project);
  const financialRisk = calculateFinancialRisk(project);
  const marketRisk = calculateMarketRisk(project);
  const technicalRisk = calculateTechnicalRisk(project);
  const liquidityRisk = calculateLiquidityRisk(project);

  const overallRisk = (legalRisk + financialRisk + marketRisk + technicalRisk + liquidityRisk) / 5;

  // Radar chart data
  const radarData = [
    { category: 'Pháp lý', score: 100 - legalRisk, fullMark: 100 },
    { category: 'Tài chính', score: 100 - financialRisk, fullMark: 100 },
    { category: 'Thị trường', score: 100 - marketRisk, fullMark: 100 },
    { category: 'Kỹ thuật', score: 100 - technicalRisk, fullMark: 100 },
    { category: 'Thanh khoản', score: 100 - liquidityRisk, fullMark: 100 }
  ];

  const riskCategories = [
    {
      name: "Rủi ro pháp lý",
      score: legalRisk,
      icon: Shield,
      description: "Đánh giá về giấy tờ pháp lý, quyền sở hữu và các vấn đề pháp lý",
      details: getLegalRiskDetails(project)
    },
    {
      name: "Rủi ro tài chính",
      score: financialRisk,
      icon: DollarSign,
      description: "Đánh giá về khả năng tài chính của chủ đầu tư và dự án",
      details: getFinancialRiskDetails(project)
    },
    {
      name: "Rủi ro thị trường",
      score: marketRisk,
      icon: TrendingDown,
      description: "Đánh giá về biến động giá và nhu cầu thị trường",
      details: getMarketRiskDetails(project)
    },
    {
      name: "Rủi ro kỹ thuật",
      score: technicalRisk,
      icon: Building2,
      description: "Đánh giá về chất lượng xây dựng và tiến độ thi công",
      details: getTechnicalRiskDetails(project)
    },
    {
      name: "Rủi ro thanh khoản",
      score: liquidityRisk,
      icon: Users,
      description: "Đánh giá về khả năng bán lại và tính thanh khoản",
      details: getLiquidityRiskDetails(project)
    }
  ];

  function getRiskLevel(score: number): { label: string; color: string; bgColor: string } {
    if (score <= 30) return { label: "Thấp", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" };
    if (score <= 60) return { label: "Trung bình", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" };
    return { label: "Cao", color: "text-red-700", bgColor: "bg-red-50 border-red-200" };
  }

  const overallRiskLevel = getRiskLevel(overallRisk);

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Phân tích rủi ro đầu tư
          </CardTitle>
          <Badge className={`${overallRiskLevel.bgColor} ${overallRiskLevel.color} border px-3 py-1 font-bold`}>
            Rủi ro {overallRiskLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Risk Score */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200">
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-slate-900 mb-2">
              {overallRisk.toFixed(0)}
              <span className="text-2xl text-slate-600">/100</span>
            </div>
            <div className="text-sm text-slate-600">Điểm rủi ro tổng thể</div>
          </div>
          <Progress value={overallRisk} className="h-3 mb-2" />
          <p className="text-xs text-center text-slate-600">
            {overallRisk <= 30 && "Dự án có mức độ rủi ro thấp, phù hợp cho nhà đầu tư bảo thủ"}
            {overallRisk > 30 && overallRisk <= 60 && "Dự án có mức độ rủi ro trung bình, cần xem xét kỹ trước khi đầu tư"}
            {overallRisk > 60 && "Dự án có mức độ rủi ro cao, chỉ phù hợp cho nhà đầu tư có kinh nghiệm"}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Biểu đồ rủi ro đa chiều</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="category" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  stroke="#64748b"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'Điểm an toàn']}
                />
                <Radar
                  name="Điểm an toàn"
                  dataKey="score"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Risk Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Phân tích chi tiết từng loại rủi ro</h3>
          
          {riskCategories.map((category, index) => {
            const IconComponent = category.icon;
            const riskLevel = getRiskLevel(category.score);

            return (
              <Card key={index} className={`rounded-xl border ${riskLevel.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${riskLevel.bgColor} border`}>
                      <IconComponent className={`w-6 h-6 ${riskLevel.color}`} />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{category.name}</h4>
                          <p className="text-xs text-slate-600 mt-1">{category.description}</p>
                        </div>
                        <Badge className={`${riskLevel.bgColor} ${riskLevel.color} border`}>
                          {riskLevel.label}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Điểm rủi ro</span>
                          <span className={`font-bold ${riskLevel.color}`}>
                            {category.score.toFixed(0)}/100
                          </span>
                        </div>
                        <Progress value={category.score} className="h-2" />
                      </div>

                      {/* Risk Details */}
                      <div className="space-y-2">
                        {category.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            {detail.isPositive ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-slate-700 leading-relaxed">{detail.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Investment Recommendation */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900 mb-2">Khuyến nghị đầu tư</div>
              <div className="text-sm text-blue-700 leading-relaxed space-y-2">
                {overallRisk <= 30 && (
                  <>
                    <p>✓ Dự án có mức độ rủi ro thấp, phù hợp cho:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Nhà đầu tư bảo thủ, ưu tiên an toàn</li>
                      <li>Người mua để ở lâu dài</li>
                      <li>Nhà đầu tư lần đầu</li>
                    </ul>
                  </>
                )}
                {overallRisk > 30 && overallRisk <= 60 && (
                  <>
                    <p>⚠ Dự án có mức độ rủi ro trung bình, nên:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Xem xét kỹ các điểm rủi ro đã nêu</li>
                      <li>Tham khảo ý kiến chuyên gia</li>
                      <li>Chuẩn bị phương án dự phòng</li>
                      <li>Phù hợp cho nhà đầu tư có kinh nghiệm</li>
                    </ul>
                  </>
                )}
                {overallRisk > 60 && (
                  <>
                    <p>⚠ Dự án có mức độ rủi ro cao, chỉ nên:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Đầu tư nếu bạn là nhà đầu tư chuyên nghiệp</li>
                      <li>Có khả năng chấp nhận rủi ro cao</li>
                      <li>Đã nghiên cứu kỹ lưỡng tất cả các yếu tố</li>
                      <li>Có kế hoạch thoái vốn rõ ràng</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions to calculate risk scores
function calculateLegalRisk(project: Project): number {
  let risk = 0;
  
  // Legal score impact (inverse)
  risk += (10 - project.legalScore) * 5;
  
  // Warnings impact
  risk += project.warnings.length * 15;
  
  // Status impact
  if (project.status === "danger") risk += 30;
  else if (project.status === "warning") risk += 15;
  
  return Math.min(risk, 100);
}

function calculateFinancialRisk(project: Project): number {
  let risk = 30; // Base risk
  
  // Developer reputation (mock - in real app would check database)
  const reputableDevelopers = ["Vingroup", "Vinhomes", "Novaland", "Masterise Group"];
  if (reputableDevelopers.includes(project.developer)) {
    risk -= 15;
  }
  
  // Sales progress
  if (project.soldUnits && project.totalUnits) {
    const salesRate = project.soldUnits / project.totalUnits;
    if (salesRate > 0.7) risk -= 10;
    else if (salesRate < 0.3) risk += 15;
  }
  
  return Math.max(0, Math.min(risk, 100));
}

function calculateMarketRisk(project: Project): number {
  let risk = 40; // Base risk
  
  // Price level
  if (project.pricePerSqm > 80000000) risk += 15; // High price = higher risk
  else if (project.pricePerSqm < 40000000) risk -= 10;
  
  // Location
  const premiumLocations = ["Quận 1", "Quận 2", "Quận 7", "Quận Hoàn Kiếm"];
  if (premiumLocations.includes(project.district)) risk -= 15;
  
  return Math.max(0, Math.min(risk, 100));
}

function calculateTechnicalRisk(project: Project): number {
  let risk = 25; // Base risk
  
  // Completion status
  if (project.completionDate === "Đã hoàn thành") {
    risk -= 15;
  } else {
    // Check if delayed (mock check)
    risk += 10;
  }
  
  return Math.max(0, Math.min(risk, 100));
}

function calculateLiquidityRisk(project: Project): number {
  let risk = 35; // Base risk
  
  // Location impact on liquidity
  const highLiquidityAreas = ["Quận 1", "Quận 2", "Quận 7", "Quận 9"];
  if (highLiquidityAreas.includes(project.district)) risk -= 15;
  
  // Price impact
  if (project.pricePerSqm > 100000000) risk += 20; // Very high price = harder to sell
  
  return Math.max(0, Math.min(risk, 100));
}

// Helper functions to get risk details
function getLegalRiskDetails(project: Project) {
  const details = [];
  
  if (project.legalScore >= 8) {
    details.push({ isPositive: true, text: "Điểm pháp lý cao, giấy tờ đầy đủ" });
  } else {
    details.push({ isPositive: false, text: "Điểm pháp lý chưa cao, cần xem xét kỹ" });
  }
  
  if (project.warnings.length === 0) {
    details.push({ isPositive: true, text: "Không có cảnh báo pháp lý" });
  } else {
    details.push({ isPositive: false, text: `Có ${project.warnings.length} cảnh báo cần lưu ý` });
  }
  
  if (project.status === "good") {
    details.push({ isPositive: true, text: "Trạng thái pháp lý tốt" });
  } else {
    details.push({ isPositive: false, text: "Trạng thái pháp lý cần xem xét" });
  }
  
  return details;
}

function getFinancialRiskDetails(project: Project) {
  const details = [];
  const reputableDevelopers = ["Vingroup", "Vinhomes", "Novaland", "Masterise Group"];
  
  if (reputableDevelopers.includes(project.developer)) {
    details.push({ isPositive: true, text: "Chủ đầu tư uy tín, tài chính vững mạnh" });
  } else {
    details.push({ isPositive: false, text: "Cần xác minh năng lực tài chính chủ đầu tư" });
  }
  
  if (project.soldUnits && project.totalUnits) {
    const salesRate = project.soldUnits / project.totalUnits;
    if (salesRate > 0.7) {
      details.push({ isPositive: true, text: "Tỷ lệ bán hàng cao, dự án được thị trường đón nhận" });
    } else if (salesRate < 0.3) {
      details.push({ isPositive: false, text: "Tỷ lệ bán hàng thấp, cần xem xét kỹ" });
    }
  }
  
  details.push({ isPositive: true, text: "Nên kiểm tra thư bảo lãnh ngân hàng" });
  
  return details;
}

function getMarketRiskDetails(project: Project) {
  const details = [];
  
  if (project.pricePerSqm > 80000000) {
    details.push({ isPositive: false, text: "Giá cao hơn trung bình thị trường" });
  } else {
    details.push({ isPositive: true, text: "Giá cạnh tranh so với thị trường" });
  }
  
  const premiumLocations = ["Quận 1", "Quận 2", "Quận 7", "Quận Hoàn Kiếm"];
  if (premiumLocations.includes(project.district)) {
    details.push({ isPositive: true, text: "Vị trí đắc địa, nhu cầu cao" });
  } else {
    details.push({ isPositive: false, text: "Vị trí cần đánh giá kỹ về tiềm năng" });
  }
  
  if (project.rentalYield && project.rentalYield > 5) {
    details.push({ isPositive: true, text: "ROI cho thuê hấp dẫn" });
  }
  
  return details;
}

function getTechnicalRiskDetails(project: Project) {
  const details = [];
  
  if (project.completionDate === "Đã hoàn thành") {
    details.push({ isPositive: true, text: "Dự án đã hoàn thành, giảm rủi ro thi công" });
  } else {
    details.push({ isPositive: false, text: "Dự án đang thi công, có rủi ro chậm tiến độ" });
  }
  
  const reputableDevelopers = ["Vingroup", "Vinhomes", "Novaland"];
  if (reputableDevelopers.includes(project.developer)) {
    details.push({ isPositive: true, text: "Chủ đầu tư có uy tín về chất lượng xây dựng" });
  }
  
  details.push({ isPositive: true, text: "Nên kiểm tra chứng nhận nghiệm thu PCCC" });
  
  return details;
}

function getLiquidityRiskDetails(project: Project) {
  const details = [];
  
  const highLiquidityAreas = ["Quận 1", "Quận 2", "Quận 7", "Quận 9"];
  if (highLiquidityAreas.includes(project.district)) {
    details.push({ isPositive: true, text: "Khu vực có tính thanh khoản cao" });
  } else {
    details.push({ isPositive: false, text: "Tính thanh khoản cần xem xét" });
  }
  
  if (project.pricePerSqm < 60000000) {
    details.push({ isPositive: true, text: "Mức giá dễ tiếp cận, dễ bán lại" });
  } else if (project.pricePerSqm > 100000000) {
    details.push({ isPositive: false, text: "Giá cao, khó bán lại trong ngắn hạn" });
  }
  
  if (project.soldUnits && project.totalUnits && project.soldUnits / project.totalUnits > 0.6) {
    details.push({ isPositive: true, text: "Dự án được thị trường đón nhận tốt" });
  }
  
  return details;
}

export default RiskAnalysis;