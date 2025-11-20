import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VIPGate from "@/components/vip/VIPGate";
import { Zap, Radar } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, ResponsiveContainer, Tooltip
} from "recharts";

interface PremiumCatalystRadarProps {
  projectId: string;
  catalysts: any[];
}

const PremiumCatalystRadar = ({ projectId, catalysts }: PremiumCatalystRadarProps) => {
  // Mock data processing for radar chart based on catalyst types
  // In a real app, this would aggregate the `impact_level` and `estimated_price_impact_percent`
  
  // Count catalysts by type and calculate average impact
  const types = ['infrastructure', 'policy', 'economic', 'supply_demand', 'developer_reputation'];
  const labels = {
    infrastructure: 'Hạ tầng',
    policy: 'Chính sách',
    economic: 'Kinh tế',
    supply_demand: 'Cung cầu',
    developer_reputation: 'Uy tín CĐT'
  };

  const radarData = types.map(type => {
    const relevant = catalysts.filter(c => c.catalyst_type === type);
    const count = relevant.length;
    // Mock score calculation: Base 50 + (count * 10) + (avg impact * 2)
    const score = Math.min(100, 50 + (count * 10)); 
    
    return {
      subject: labels[type as keyof typeof labels],
      A: score,
      fullMark: 100
    };
  });

  return (
    <VIPGate requiredLevel="premium">
      <Card className="border-2 border-purple-100 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
            <Radar className="w-5 h-5" />
            Radar Tác động Giá (Premium)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e9d5ff" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b21a8', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#d8b4fe" />
                <RechartsRadar
                  name="Tác động"
                  dataKey="A"
                  stroke="#9333ea"
                  fill="#a855f7"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="absolute bottom-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur p-2 rounded-lg text-xs text-muted-foreground border shadow-sm max-w-[200px]">
              <div className="flex items-center gap-1 font-bold text-purple-700 mb-1">
                <Zap className="w-3 h-3" /> Phân tích AI
              </div>
              Dự án chịu tác động mạnh nhất từ yếu tố <strong>Hạ tầng</strong> (Metro, Vành đai 3).
            </div>
          </div>
        </CardContent>
      </Card>
    </VIPGate>
  );
};

export default PremiumCatalystRadar;