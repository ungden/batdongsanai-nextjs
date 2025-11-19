import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  DollarSign,
  Home,
  CreditCard,
  Construction,
  Upload,
  Plus,
  BarChart3,
  Database
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DataImportExport } from '@/components/admin/DataImportExport';
import { DataSeeder } from '@/components/admin/DataSeeder';

const DataManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Catalyst Form State
  const [catalystForm, setCatalystForm] = useState({
    catalyst_type: 'infrastructure',
    title: '',
    description: '',
    impact_level: 'medium',
    impact_direction: 'positive',
    affected_areas: '',
    announcement_date: '',
    effective_date: '',
    estimated_price_impact_percent: '',
    source_url: ''
  });

  // Pricing Form State
  const [pricingForm, setPricingForm] = useState({
    project_id: '',
    price_date: '',
    price_type: 'current',
    price_per_sqm: '',
    unit_type: '',
    source: 'manual_entry',
    confidence_score: '1.00'
  });

  // Rental Form State
  const [rentalForm, setRentalForm] = useState({
    project_id: '',
    data_date: '',
    unit_type: '',
    rental_price_min: '',
    rental_price_max: '',
    rental_price_avg: '',
    occupancy_rate: '',
    yield_percentage: '',
    tenant_profile: '',
    seasonal_demand: 'medium'
  });

  // Payment Policy Form State
  const [policyForm, setPolicyForm] = useState({
    project_id: '',
    policy_name: '',
    policy_type: 'installment',
    description: '',
    down_payment_percent: '',
    installment_periods: '',
    interest_rate: '',
    bank_partner: '',
    start_date: '',
    end_date: ''
  });

  // Infrastructure Form State
  const [infraForm, setInfraForm] = useState({
    infrastructure_type: 'metro',
    name: '',
    description: '',
    location_district: '',
    status: 'under_construction',
    start_date: '',
    expected_completion: '',
    budget_vnd: '',
    estimated_property_impact_percent: ''
  });

  const handleCatalystSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('market_catalysts' as any).insert({
        ...catalystForm,
        affected_areas: catalystForm.affected_areas.split(',').map(a => a.trim()),
        estimated_price_impact_percent: parseFloat(catalystForm.estimated_price_impact_percent),
        created_by: user.id
      });

      if (error) throw error;

      toast.success('Đã thêm catalyst thành công');
      setCatalystForm({
        catalyst_type: 'infrastructure',
        title: '',
        description: '',
        impact_level: 'medium',
        impact_direction: 'positive',
        affected_areas: '',
        announcement_date: '',
        effective_date: '',
        estimated_price_impact_percent: '',
        source_url: ''
      });
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('project_pricing_history' as any).insert({
        ...pricingForm,
        price_per_sqm: parseFloat(pricingForm.price_per_sqm),
        confidence_score: parseFloat(pricingForm.confidence_score)
      });

      if (error) throw error;

      toast.success('Đã thêm pricing data');
      setPricingForm({
        project_id: '',
        price_date: '',
        price_type: 'current',
        price_per_sqm: '',
        unit_type: '',
        source: 'manual_entry',
        confidence_score: '1.00'
      });
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('rental_market_data' as any).insert({
        ...rentalForm,
        rental_price_min: rentalForm.rental_price_min ? parseFloat(rentalForm.rental_price_min) : null,
        rental_price_max: rentalForm.rental_price_max ? parseFloat(rentalForm.rental_price_max) : null,
        rental_price_avg: rentalForm.rental_price_avg ? parseFloat(rentalForm.rental_price_avg) : null,
        occupancy_rate: rentalForm.occupancy_rate ? parseFloat(rentalForm.occupancy_rate) : null,
        yield_percentage: rentalForm.yield_percentage ? parseFloat(rentalForm.yield_percentage) : null
      });

      if (error) throw error;

      toast.success('Đã thêm rental data');
      setRentalForm({
        project_id: '',
        data_date: '',
        unit_type: '',
        rental_price_min: '',
        rental_price_max: '',
        rental_price_avg: '',
        occupancy_rate: '',
        yield_percentage: '',
        tenant_profile: '',
        seasonal_demand: 'medium'
      });
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('payment_policies' as any).insert({
        ...policyForm,
        down_payment_percent: policyForm.down_payment_percent ? parseFloat(policyForm.down_payment_percent) : null,
        installment_periods: policyForm.installment_periods ? parseInt(policyForm.installment_periods) : null,
        interest_rate: policyForm.interest_rate ? parseFloat(policyForm.interest_rate) : null,
        is_active: true
      });

      if (error) throw error;

      toast.success('Đã thêm payment policy');
      setPolicyForm({
        project_id: '',
        policy_name: '',
        policy_type: 'installment',
        description: '',
        down_payment_percent: '',
        installment_periods: '',
        interest_rate: '',
        bank_partner: '',
        start_date: '',
        end_date: ''
      });
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInfraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('infrastructure_developments' as any).insert({
        ...infraForm,
        budget_vnd: infraForm.budget_vnd ? parseFloat(infraForm.budget_vnd) : null,
        estimated_property_impact_percent: infraForm.estimated_property_impact_percent ? parseFloat(infraForm.estimated_property_impact_percent) : null
      });

      if (error) throw error;

      toast.success('Đã thêm infrastructure data');
      setInfraForm({
        infrastructure_type: 'metro',
        name: '',
        description: '',
        location_district: '',
        status: 'under_construction',
        start_date: '',
        expected_completion: '',
        budget_vnd: '',
        estimated_property_impact_percent: ''
      });
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý dữ liệu thị trường & insights
        </p>
      </div>

      <Tabs defaultValue="catalysts" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="catalysts">
            <Zap className="h-4 w-4 mr-2" />
            Catalysts
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="rental">
            <Home className="h-4 w-4 mr-2" />
            Rental
          </TabsTrigger>
          <TabsTrigger value="policies">
            <CreditCard className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="infrastructure">
            <Construction className="h-4 w-4 mr-2" />
            Infrastructure
          </TabsTrigger>
          <TabsTrigger value="import-export">
            <Database className="h-4 w-4 mr-2" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="seeder">
            <Upload className="h-4 w-4 mr-2" />
            Seeder
          </TabsTrigger>
        </TabsList>

        {/* CATALYSTS TAB */}
        <TabsContent value="catalysts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Market Catalyst</CardTitle>
              <CardDescription>
                Thêm yếu tố tác động đến thị trường BĐS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCatalystSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={catalystForm.catalyst_type}
                      onValueChange={(value) => setCatalystForm({ ...catalystForm, catalyst_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="economic">Economic</SelectItem>
                        <SelectItem value="supply_demand">Supply/Demand</SelectItem>
                        <SelectItem value="developer_reputation">Developer Reputation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Impact Direction</Label>
                    <Select
                      value={catalystForm.impact_direction}
                      onValueChange={(value) => setCatalystForm({ ...catalystForm, impact_direction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Impact Level</Label>
                    <Select
                      value={catalystForm.impact_level}
                      onValueChange={(value) => setCatalystForm({ ...catalystForm, impact_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_high">Very High</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Impact %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={catalystForm.estimated_price_impact_percent}
                      onChange={(e) => setCatalystForm({ ...catalystForm, estimated_price_impact_percent: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    required
                    placeholder="Metro Line 1 Opening"
                    value={catalystForm.title}
                    onChange={(e) => setCatalystForm({ ...catalystForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    required
                    placeholder="Chi tiết về catalyst..."
                    value={catalystForm.description}
                    onChange={(e) => setCatalystForm({ ...catalystForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Affected Areas (comma separated)</Label>
                    <Input
                      placeholder="District 1, District 2, Thu Duc"
                      value={catalystForm.affected_areas}
                      onChange={(e) => setCatalystForm({ ...catalystForm, affected_areas: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Source URL</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={catalystForm.source_url}
                      onChange={(e) => setCatalystForm({ ...catalystForm, source_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Announcement Date</Label>
                    <Input
                      type="date"
                      value={catalystForm.announcement_date}
                      onChange={(e) => setCatalystForm({ ...catalystForm, announcement_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={catalystForm.effective_date}
                      onChange={(e) => setCatalystForm({ ...catalystForm, effective_date: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Đang thêm...' : 'Thêm Catalyst'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRICING TAB */}
        <TabsContent value="pricing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Pricing Data</CardTitle>
              <CardDescription>
                Thêm dữ liệu giá lịch sử hoặc dự báo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePricingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project ID *</Label>
                    <Input
                      required
                      placeholder="vinhomes-central-park"
                      value={pricingForm.project_id}
                      onChange={(e) => setPricingForm({ ...pricingForm, project_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price Date *</Label>
                    <Input
                      required
                      type="date"
                      value={pricingForm.price_date}
                      onChange={(e) => setPricingForm({ ...pricingForm, price_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price Type</Label>
                    <Select
                      value={pricingForm.price_type}
                      onValueChange={(value) => setPricingForm({ ...pricingForm, price_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="launch">Launch</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="transaction">Transaction</SelectItem>
                        <SelectItem value="forecast">Forecast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price per sqm (VND) *</Label>
                    <Input
                      required
                      type="number"
                      placeholder="95000000"
                      value={pricingForm.price_per_sqm}
                      onChange={(e) => setPricingForm({ ...pricingForm, price_per_sqm: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Type</Label>
                    <Input
                      placeholder="2BR"
                      value={pricingForm.unit_type}
                      onChange={(e) => setPricingForm({ ...pricingForm, unit_type: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input
                      placeholder="developer"
                      value={pricingForm.source}
                      onChange={(e) => setPricingForm({ ...pricingForm, source: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Đang thêm...' : 'Thêm Pricing Data'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RENTAL TAB */}
        <TabsContent value="rental" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Rental Data</CardTitle>
              <CardDescription>
                Thêm dữ liệu thị trường cho thuê
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRentalSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project ID *</Label>
                    <Input
                      required
                      placeholder="vinhomes-central-park"
                      value={rentalForm.project_id}
                      onChange={(e) => setRentalForm({ ...rentalForm, project_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Date *</Label>
                    <Input
                      required
                      type="date"
                      value={rentalForm.data_date}
                      onChange={(e) => setRentalForm({ ...rentalForm, data_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Type *</Label>
                    <Input
                      required
                      placeholder="2BR"
                      value={rentalForm.unit_type}
                      onChange={(e) => setRentalForm({ ...rentalForm, unit_type: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rental Price Avg (VND)</Label>
                    <Input
                      type="number"
                      placeholder="28000000"
                      value={rentalForm.rental_price_avg}
                      onChange={(e) => setRentalForm({ ...rentalForm, rental_price_avg: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rental Price Min</Label>
                    <Input
                      type="number"
                      placeholder="25000000"
                      value={rentalForm.rental_price_min}
                      onChange={(e) => setRentalForm({ ...rentalForm, rental_price_min: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rental Price Max</Label>
                    <Input
                      type="number"
                      placeholder="32000000"
                      value={rentalForm.rental_price_max}
                      onChange={(e) => setRentalForm({ ...rentalForm, rental_price_max: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Occupancy Rate %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="92.0"
                      value={rentalForm.occupancy_rate}
                      onChange={(e) => setRentalForm({ ...rentalForm, occupancy_rate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Yield %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      value={rentalForm.yield_percentage}
                      onChange={(e) => setRentalForm({ ...rentalForm, yield_percentage: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tenant Profile</Label>
                    <Input
                      placeholder="expat"
                      value={rentalForm.tenant_profile}
                      onChange={(e) => setRentalForm({ ...rentalForm, tenant_profile: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seasonal Demand</Label>
                    <Select
                      value={rentalForm.seasonal_demand}
                      onValueChange={(value) => setRentalForm({ ...rentalForm, seasonal_demand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Đang thêm...' : 'Thêm Rental Data'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENT POLICIES TAB */}
        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Payment Policy</CardTitle>
              <CardDescription>
                Thêm chính sách thanh toán & ưu đãi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePolicySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project ID *</Label>
                    <Input
                      required
                      placeholder="vinhomes-central-park"
                      value={policyForm.project_id}
                      onChange={(e) => setPolicyForm({ ...policyForm, project_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Policy Name *</Label>
                    <Input
                      required
                      placeholder="Standard Bank Loan 70%"
                      value={policyForm.policy_name}
                      onChange={(e) => setPolicyForm({ ...policyForm, policy_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Policy Type</Label>
                    <Select
                      value={policyForm.policy_type}
                      onValueChange={(value) => setPolicyForm({ ...policyForm, policy_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="installment">Installment</SelectItem>
                        <SelectItem value="bank_loan">Bank Loan</SelectItem>
                        <SelectItem value="developer_financing">Developer Financing</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Down Payment %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="30"
                      value={policyForm.down_payment_percent}
                      onChange={(e) => setPolicyForm({ ...policyForm, down_payment_percent: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Installment Periods (months)</Label>
                    <Input
                      type="number"
                      placeholder="240"
                      value={policyForm.installment_periods}
                      onChange={(e) => setPolicyForm({ ...policyForm, installment_periods: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Interest Rate %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="7.5"
                      value={policyForm.interest_rate}
                      onChange={(e) => setPolicyForm({ ...policyForm, interest_rate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Partner</Label>
                    <Input
                      placeholder="Vietcombank"
                      value={policyForm.bank_partner}
                      onChange={(e) => setPolicyForm({ ...policyForm, bank_partner: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={policyForm.start_date}
                      onChange={(e) => setPolicyForm({ ...policyForm, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={policyForm.end_date}
                      onChange={(e) => setPolicyForm({ ...policyForm, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Mô tả chi tiết chính sách..."
                    value={policyForm.description}
                    onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Đang thêm...' : 'Thêm Payment Policy'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFRASTRUCTURE TAB */}
        <TabsContent value="infrastructure" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Infrastructure Development</CardTitle>
              <CardDescription>
                Thêm dự án hạ tầng mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfraSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Infrastructure Type</Label>
                    <Select
                      value={infraForm.infrastructure_type}
                      onValueChange={(value) => setInfraForm({ ...infraForm, infrastructure_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metro">Metro</SelectItem>
                        <SelectItem value="highway">Highway</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="mall">Mall</SelectItem>
                        <SelectItem value="park">Park</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={infraForm.status}
                      onValueChange={(value) => setInfraForm({ ...infraForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="under_construction">Under Construction</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      required
                      placeholder="Metro Line 1"
                      value={infraForm.name}
                      onChange={(e) => setInfraForm({ ...infraForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location District</Label>
                    <Input
                      placeholder="District 1"
                      value={infraForm.location_district}
                      onChange={(e) => setInfraForm({ ...infraForm, location_district: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={infraForm.start_date}
                      onChange={(e) => setInfraForm({ ...infraForm, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expected Completion</Label>
                    <Input
                      type="date"
                      value={infraForm.expected_completion}
                      onChange={(e) => setInfraForm({ ...infraForm, expected_completion: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Budget (VND)</Label>
                    <Input
                      type="number"
                      placeholder="43757000000000"
                      value={infraForm.budget_vnd}
                      onChange={(e) => setInfraForm({ ...infraForm, budget_vnd: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Property Impact %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={infraForm.estimated_property_impact_percent}
                      onChange={(e) => setInfraForm({ ...infraForm, estimated_property_impact_percent: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Mô tả chi tiết dự án hạ tầng..."
                    value={infraForm.description}
                    onChange={(e) => setInfraForm({ ...infraForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Đang thêm...' : 'Thêm Infrastructure'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPORT/EXPORT TAB */}
        <TabsContent value="import-export" className="mt-6">
          <DataImportExport />
        </TabsContent>

        {/* SEEDER TAB */}
        <TabsContent value="seeder" className="mt-6">
          <DataSeeder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;