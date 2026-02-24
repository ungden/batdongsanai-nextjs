"use client";

import { useState } from 'react';
import { useAdminLeads, useLeadStats, LeadFilters, LeadInquiry } from '@/hooks/useAdminLeads';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  Download,
  UserCheck,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

export default function LeadManagement() {
  const [filters, setFilters] = useState<LeadFilters>({
    quality: 'all',
    status: 'all',
    assigned: 'all',
  });

  const { leads, loading, totalCount, assignLead, updateLeadNotes, updateLeadStatus, exportLeads } =
    useAdminLeads(filters);
  const { stats, loading: statsLoading } = useLeadStats();

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Leads</h1>
          <p className="text-muted-foreground mt-1">
            AI tổng hợp & phân tích {totalCount} leads
          </p>
        </div>
        <Button onClick={exportLeads}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng Leads"
          value={stats?.total_leads || 0}
          icon={Users}
          loading={statsLoading}
        />
        <StatsCard
          title="Hot Leads 🔥"
          value={stats?.hot_leads || 0}
          icon={Zap}
          trend="up"
          loading={statsLoading}
          className="border-red-200 bg-red-50"
        />
        <StatsCard
          title="Điểm TB"
          value={stats?.avg_score?.toFixed(0) || '0'}
          icon={Target}
          suffix="/100"
          loading={statsLoading}
        />
        <StatsCard
          title="Conversion"
          value={stats?.conversion_rate?.toFixed(1) || '0'}
          icon={TrendingUp}
          suffix="%"
          loading={statsLoading}
          className="border-green-200 bg-green-50"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Chất lượng</Label>
              <Select
                value={filters.quality || 'all'}
                onValueChange={(value) => handleFilterChange('quality', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="warm">⚡ Warm</SelectItem>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                  <SelectItem value="unqualified">❌ Unqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="assigned">Đã assign</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="closed_won">Chốt thành công</SelectItem>
                  <SelectItem value="closed_lost">Không thành công</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Phân công</Label>
              <Select
                value={filters.assigned || 'all'}
                onValueChange={(value) => handleFilterChange('assigned', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="unassigned">Chưa assign</SelectItem>
                  <SelectItem value="assigned">Đã assign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ngày tạo</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Leads ({totalCount})</CardTitle>
          <CardDescription>Được sắp xếp theo điểm AI cao nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có leads nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onAssign={assignLead}
                  onUpdateNotes={updateLeadNotes}
                  onUpdateStatus={updateLeadStatus}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: any;
  trend?: 'up' | 'down';
  suffix?: string;
  loading?: boolean;
  className?: string;
}

function StatsCard({ title, value, icon: Icon, trend, suffix, loading, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LeadCardProps {
  lead: LeadInquiry;
  onAssign: (inquiryId: string, agentId: string) => Promise<boolean>;
  onUpdateNotes: (inquiryId: string, notes: string) => Promise<boolean>;
  onUpdateStatus: (inquiryId: string, status: string) => Promise<boolean>;
}

function LeadCard({ lead, onAssign, onUpdateNotes, onUpdateStatus }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(lead.admin_notes || '');

  const qualityConfig = {
    hot: { label: 'HOT', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔥' },
    warm: { label: 'WARM', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⚡' },
    cold: { label: 'COLD', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '❄️' },
    unqualified: { label: 'UNQUALIFIED', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '❌' },
  };

  const quality = qualityConfig[lead.lead_quality] || qualityConfig.unqualified;

  return (
    <Card className="hover-shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Score Badge */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {lead.lead_score}
            </div>
            <Badge className={`mt-2 ${quality.color} border`}>
              {quality.icon} {quality.label}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{lead.customer_name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.customer_phone}
                  </span>
                  {lead.customer_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.customer_email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">{getInquiryTypeLabel(lead.inquiry_type)}</Badge>
                <Badge variant={getStatusVariant(lead.status)}>{getStatusLabel(lead.status)}</Badge>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">🤖 AI Summary:</p>
              <p className="text-sm text-blue-800 mt-1">{lead.ai_summary}</p>
            </div>

            {/* AI Recommendations */}
            {lead.ai_recommendations && lead.ai_recommendations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-muted-foreground">💡 Gợi ý:</span>
                {lead.ai_recommendations.map((rec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {rec}
                  </Badge>
                ))}
              </div>
            )}

            {/* Details (expandable) */}
            {showDetails && (
              <div className="border-t pt-3 space-y-2">
                {lead.message && (
                  <div>
                    <Label className="text-xs">Tin nhắn:</Label>
                    <p className="text-sm">{lead.message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {lead.budget_min && (
                    <div>
                      <span className="text-muted-foreground">Ngân sách:</span>{' '}
                      {formatCurrency(lead.budget_min)}
                      {lead.budget_max && ` - ${formatCurrency(lead.budget_max)}`}
                    </div>
                  )}
                  {lead.preferred_bedrooms && (
                    <div>
                      <span className="text-muted-foreground">Phòng ngủ:</span> {lead.preferred_bedrooms}
                    </div>
                  )}
                  {lead.move_in_timeline && (
                    <div>
                      <span className="text-muted-foreground">Timeline:</span> {getTimelineLabel(lead.move_in_timeline)}
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                <div>
                  <Label className="text-xs">Ghi chú (Admin):</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thêm ghi chú..."
                    rows={2}
                    className="mt-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => onUpdateNotes(lead.id, notes)}
                  >
                    Lưu ghi chú
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </Button>

              {!lead.assigned_agent_id && (
                <Button size="sm" variant="default">
                  <UserCheck className="h-4 w-4 mr-1" />
                  Assign Agent
                </Button>
              )}

              <Select
                value={lead.status}
                onValueChange={(value) => onUpdateStatus(lead.id, value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Đổi trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="viewing_scheduled">Đã hẹn xem</SelectItem>
                  <SelectItem value="negotiating">Đàm phán</SelectItem>
                  <SelectItem value="closed_won">Chốt thành công</SelectItem>
                  <SelectItem value="closed_lost">Không thành công</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getInquiryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    general: 'Tư vấn chung',
    viewing: 'Xem nhà',
    pricing: 'Hỏi giá',
    purchase: 'Muốn mua',
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'Mới',
    assigned: 'Đã assign',
    contacted: 'Đã liên hệ',
    viewing_scheduled: 'Đã hẹn xem',
    negotiating: 'Đàm phán',
    closed_won: 'Thành công',
    closed_lost: 'Thất bại',
  };
  return labels[status] || status;
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'closed_won') return 'default';
  if (status === 'closed_lost') return 'destructive';
  if (status === 'new') return 'secondary';
  return 'outline';
}

function getTimelineLabel(timeline: string): string {
  const labels: Record<string, string> = {
    immediate: 'Ngay lập tức',
    '1-3_months': '1-3 tháng',
    '3-6_months': '3-6 tháng',
    '6-12_months': '6-12 tháng',
    '12+_months': 'Trên 12 tháng',
  };
  return labels[timeline] || timeline;
}