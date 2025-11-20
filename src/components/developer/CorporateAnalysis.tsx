import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import VIPGate from "@/components/vip/VIPGate";
import { Developer } from "@/types/developer";
import { 
  TrendingUp, ShieldCheck, AlertTriangle, 
  DollarSign, Briefcase, BarChart4, Target 
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";

interface CorporateAnalysisProps {
  developer: Developer;
}

const CorporateAnalysis = ({ developer }: CorporateAnalysisProps) => {
  // Mock data for analysis (In production, this would come from AI/Database)
  const financialHealth = 85;
  const reputationScore = developer.avgLegalScore * 10;
  const deliveryQuality = developer.avgRating ? developer.avgRating * 20 : 70;
  
  const radarData = [
    { subject: 'Tài chính', A: financialHealth, fullMark: 100 },
    { subject: 'Pháp lý', A: reputationScore, fullMark: 100 },
    { subject: 'Tiến độ', A: 90, fullMark: 100 },
    { subject: 'Chất lượng', A: deliveryQuality, fullMark: 100 },
    { subject: 'Hậu mãi', A: 75, fullMark: 100 },
    { subject: 'Thanh khoản', A: 80, fullMark: 100 },
  ];

  const swotData = {
    strengths: ["Quỹ đất sạch lớn", "Năng lực tài chính vững mạnh", "Đối tác chiến lược quốc tế"],
    weaknesses: ["Giá bán thường cao hơn thị trường", "Phí quản lý cao"],
    opportunities: ["Hưởng lợi từ hạ tầng khu Đông", "Nhu cầu BĐS hạng sang tăng"],
    threats: ["Chính sách tín dụng thắt chặt", "Cạnh tranh từ các CĐT nước ngoài"]
  };

  return (
    <VIPGate requiredLevel="pro">
      <div className="space-y-6">
        {/* Financial Health Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <DollarSign className="w-4 h-4" /> Sức khỏe tài chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">A+</div>
              <Progress value={95} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">Vốn chủ sở hữu cao, tỷ lệ nợ thấp.</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4" /> Uy tín pháp lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                {developer.avgLegalScore}/10
              </div>
              <Progress value={developer.avgLegalScore * 10} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">Lịch sử bàn giao sổ hồng đúng hạn.</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <Briefcase className="w-4 h-4" /> Năng lực triển khai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {developer.completedProjects} DA
              </div>
              <p className="text-xs text-muted-foreground mt-2">Đã hoàn thành và bàn giao.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Biểu đồ năng lực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                    <Radar
                      name={developer.name}
                      dataKey="A"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* SWOT Analysis */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart4 className="w-5 h-5 text-primary" /> Phân tích SWOT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Điểm mạnh (Strengths)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {swotData.strengths.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Điểm yếu (Weaknesses)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {swotData.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Cơ hội (Opportunities)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {swotData.opportunities.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Thách thức (Threats)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {swotData.threats.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VIPGate>
  );
};

export default CorporateAnalysis;