import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePaymentPolicies } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatCurrency';
import { CreditCard, Percent, Calendar, Building2, Tag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PaymentPoliciesCardProps {
  projectId: string;
}

export const PaymentPoliciesCard = ({ projectId }: PaymentPoliciesCardProps) => {
  const { paymentPolicies, loading } = usePaymentPolicies(projectId);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentPolicies.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Chính sách thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Chưa có thông tin chính sách thanh toán
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'installment':
        return <Calendar className="h-4 w-4" />;
      case 'bank_loan':
        return <Building2 className="h-4 w-4" />;
      case 'promotion':
        return <Tag className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPolicyBadgeColor = (type: string) => {
    switch (type) {
      case 'promotion':
        return 'bg-success/10 text-success border-success/20';
      case 'bank_loan':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'installment':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="hover-lift bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5" />
          Chính sách thanh toán & Ưu đãi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentPolicies.map((policy) => (
          <Card key={policy.id} className="bg-muted/30 hover:bg-muted/50 transition-colors border-border/50">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getPolicyBadgeColor(policy.policy_type)} variant="outline">
                      {getPolicyIcon(policy.policy_type)}
                      <span className="ml-1 capitalize">{policy.policy_type.replace('_', ' ')}</span>
                    </Badge>
                    {policy.end_date && new Date(policy.end_date) > new Date() && (
                      <Badge variant="destructive" className="animate-pulse-slow">
                        Có hạn
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-lg text-foreground">{policy.policy_name}</h4>
                </div>
              </div>

              {/* Description */}
              {policy.description && (
                <p className="text-sm text-muted-foreground">
                  {policy.description}
                </p>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {policy.down_payment_percent !== null && policy.down_payment_percent !== undefined && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Trả trước</div>
                    <div className="font-semibold flex items-center gap-1 text-foreground">
                      <Percent className="h-3 w-3" />
                      {policy.down_payment_percent}%
                    </div>
                  </div>
                )}

                {policy.installment_periods && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Thời gian</div>
                    <div className="font-semibold flex items-center gap-1 text-foreground">
                      <Calendar className="h-3 w-3" />
                      {policy.installment_periods} tháng
                    </div>
                  </div>
                )}

                {policy.interest_rate !== null && policy.interest_rate !== undefined && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Lãi suất</div>
                    <div className="font-semibold flex items-center gap-1 text-foreground">
                      <Percent className="h-3 w-3" />
                      {policy.interest_rate}%/năm
                    </div>
                  </div>
                )}

                {policy.bank_partner && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Ngân hàng</div>
                    <div className="font-semibold flex items-center gap-1 text-foreground">
                      <Building2 className="h-3 w-3" />
                      {policy.bank_partner}
                    </div>
                  </div>
                )}
              </div>

              {/* Promotion Details */}
              {policy.promotion_details && Object.keys(policy.promotion_details).length > 0 && (
                <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                  <div className="text-sm font-medium text-success mb-2">
                    🎁 Ưu đãi đặc biệt
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {JSON.stringify(policy.promotion_details)}
                  </div>
                </div>
              )}

              {/* Eligible Unit Types */}
              {policy.eligible_unit_types && policy.eligible_unit_types.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Áp dụng cho:</div>
                  <div className="flex flex-wrap gap-1">
                    {policy.eligible_unit_types.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-border">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Validity Period */}
              {(policy.start_date || policy.end_date) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  {policy.start_date && (
                    <div>
                      Từ: {format(new Date(policy.start_date), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  )}
                  {policy.end_date && (
                    <div>
                      Đến: {format(new Date(policy.end_date), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  )}
                </div>
              )}

              {/* Terms & Conditions */}
              {policy.terms_conditions && (
                <div className="pt-2">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => {
                      alert(policy.terms_conditions);
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Xem điều khoản & điều kiện
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Contact CTA */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Cần tư vấn thêm về các chính sách thanh toán?
            </p>
            <Button variant="default" size="sm">
              Liên hệ ngay
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};