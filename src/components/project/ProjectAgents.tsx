import { useEffect } from 'react';
import { useProjectAgents } from '@/hooks/useProjectInquiries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, Star, Award, Building2, CheckCircle } from 'lucide-react';
import { InquiryDialog } from './InquiryDialog';

interface ProjectAgentsProps {
  projectId: string;
  projectName: string;
}

export function ProjectAgents({ projectId, projectName }: ProjectAgentsProps) {
  const { agents, loading, refreshAgents } = useProjectAgents(projectId);

  useEffect(() => {
    refreshAgents();
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tư vấn viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liên hệ tư vấn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Để lại thông tin để được tư vấn chi tiết về dự án này.
          </p>
          <InquiryDialog projectId={projectId} projectName={projectName} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tư vấn viên chuyên nghiệp</CardTitle>
        <p className="text-sm text-muted-foreground">
          Đội ngũ chuyên gia sẵn sàng hỗ trợ bạn
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {agents.map((agent) => (
          <div key={agent.id} className="border rounded-lg p-4 space-y-4">
            {/* Agent Header */}
            <div className="flex gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={agent.avatar_url || undefined} alt={agent.full_name} />
                <AvatarFallback className="text-lg">
                  {agent.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{agent.full_name}</h4>
                  {agent.is_verified && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {agent.role === 'lead_agent' && (
                    <Badge variant="default">Trưởng nhóm</Badge>
                  )}
                </div>

                {agent.company_name && (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Building2 className="h-3 w-3 mr-1" />
                    {agent.company_name}
                  </div>
                )}

                {/* Rating & Experience */}
                <div className="flex items-center gap-4 text-sm">
                  {agent.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({agent.total_reviews} đánh giá)
                      </span>
                    </div>
                  )}
                  {agent.years_experience && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      {agent.years_experience} năm kinh nghiệm
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specializations */}
            {agent.specialization && agent.specialization.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {agent.specialization.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {formatSpecialization(spec)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Bio */}
            {agent.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.bio}
              </p>
            )}

            {/* Performance Stats */}
            {agent.leads_received > 0 && (
              <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
                <div>
                  <span className="font-medium text-foreground">
                    {agent.leads_received}
                  </span>{' '}
                  khách hàng
                </div>
                {agent.leads_converted > 0 && (
                  <div>
                    <span className="font-medium text-foreground">
                      {agent.leads_converted}
                    </span>{' '}
                    giao dịch thành công
                  </div>
                )}
                {agent.leads_converted > 0 && agent.leads_received > 0 && (
                  <div>
                    Tỷ lệ:{' '}
                    <span className="font-medium text-green-600">
                      {((agent.leads_converted / agent.leads_received) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${agent.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi điện
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${agent.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        ))}

        {/* Main CTA */}
        <div className="pt-4 border-t">
          <InquiryDialog
            projectId={projectId}
            projectName={projectName}
            trigger={
              <Button size="lg" className="w-full">
                Nhận tư vấn miễn phí
              </Button>
            }
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Thông tin sẽ được gửi đến tư vấn viên phù hợp nhất
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatSpecialization(spec: string): string {
  const map: Record<string, string> = {
    luxury: 'Cao cấp',
    residential: 'Nhà ở',
    commercial: 'Thương mại',
    investment: 'Đầu tư',
    first_home_buyers: 'Người mua lần đầu',
  };
  return map[spec] || spec;
}
