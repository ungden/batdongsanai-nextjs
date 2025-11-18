
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Settings, Eye } from 'lucide-react';

interface AdminStatsProps {
  userCount: number;
  consultationCount: number;
  settingsCount: number;
  viewCount: number;
}

const AdminStats = ({ userCount, consultationCount, settingsCount, viewCount }: AdminStatsProps) => {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: userCount,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Yêu cầu tư vấn',
      value: consultationCount,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      title: 'Cài đặt hệ thống',
      value: settingsCount,
      icon: Settings,
      color: 'text-purple-600'
    },
    {
      title: 'Lượt xem dự án',
      value: viewCount,
      icon: Eye,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
