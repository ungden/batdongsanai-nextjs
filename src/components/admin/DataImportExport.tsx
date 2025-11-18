import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, FileJson, FileSpreadsheet, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Papa from 'papaparse';

type DataTable =
  | 'market_catalysts'
  | 'project_pricing_history'
  | 'rental_market_data'
  | 'payment_policies'
  | 'infrastructure_developments'
  | 'comparable_sales'
  | 'market_regulations';

export const DataImportExport = () => {
  const [selectedTable, setSelectedTable] = useState<DataTable>('market_catalysts');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const tableOptions = [
    { value: 'market_catalysts', label: 'Market Catalysts' },
    { value: 'project_pricing_history', label: 'Pricing History' },
    { value: 'rental_market_data', label: 'Rental Market Data' },
    { value: 'payment_policies', label: 'Payment Policies' },
    { value: 'infrastructure_developments', label: 'Infrastructure' },
    { value: 'comparable_sales', label: 'Comparable Sales' },
    { value: 'market_regulations', label: 'Market Regulations' },
  ];

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'Không có dữ liệu',
          description: 'Bảng này chưa có dữ liệu để export',
          variant: 'destructive',
        });
        return;
      }

      // Convert to CSV
      const csv = Papa.unparse(data);

      // Download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export thành công',
        description: `Đã export ${data.length} bản ghi từ ${selectedTable}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Lỗi export',
        description: error instanceof Error ? error.message : 'Không thể export dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Export to JSON
  const handleExportJSON = async () => {
    try {
      setExporting(true);

      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'Không có dữ liệu',
          description: 'Bảng này chưa có dữ liệu để export',
          variant: 'destructive',
        });
        return;
      }

      // Convert to JSON
      const json = JSON.stringify(data, null, 2);

      // Download file
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedTable}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export thành công',
        description: `Đã export ${data.length} bản ghi từ ${selectedTable}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Lỗi export',
        description: error instanceof Error ? error.message : 'Không thể export dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Import from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const records = results.data;

          if (records.length === 0) {
            toast({
              title: 'File rỗng',
              description: 'File CSV không có dữ liệu',
              variant: 'destructive',
            });
            return;
          }

          // Insert data in batches
          const { error } = await supabase
            .from(selectedTable)
            .insert(records);

          if (error) throw error;

          toast({
            title: 'Import thành công',
            description: `Đã import ${records.length} bản ghi vào ${selectedTable}`,
          });

          // Reset file input
          event.target.value = '';
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: 'Lỗi import',
            description: error instanceof Error ? error.message : 'Không thể import dữ liệu',
            variant: 'destructive',
          });
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        toast({
          title: 'Lỗi đọc file',
          description: 'Không thể đọc file CSV',
          variant: 'destructive',
        });
        setImporting(false);
      },
    });
  };

  // Import from JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const records = JSON.parse(json);

        if (!Array.isArray(records) || records.length === 0) {
          toast({
            title: 'Dữ liệu không hợp lệ',
            description: 'File JSON phải chứa một mảng các object',
            variant: 'destructive',
          });
          return;
        }

        // Insert data
        const { error } = await supabase
          .from(selectedTable)
          .insert(records);

        if (error) throw error;

        toast({
          title: 'Import thành công',
          description: `Đã import ${records.length} bản ghi vào ${selectedTable}`,
        });

        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Lỗi import',
          description: error instanceof Error ? error.message : 'Không thể import dữ liệu',
          variant: 'destructive',
        });
      } finally {
        setImporting(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Lỗi đọc file',
        description: 'Không thể đọc file JSON',
        variant: 'destructive',
      });
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Import & Export
          </CardTitle>
          <CardDescription>
            Import và export dữ liệu từ các bảng thị trường
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Selection */}
          <div className="space-y-2">
            <Label>Chọn bảng dữ liệu</Label>
            <Select value={selectedTable} onValueChange={(value) => setSelectedTable(value as DataTable)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bảng" />
              </SelectTrigger>
              <SelectContent>
                {tableOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Export Section */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export dữ liệu
                </CardTitle>
                <CardDescription>
                  Tải xuống dữ liệu từ bảng đã chọn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {exporting ? 'Đang export...' : 'Export CSV'}
                </Button>
                <Button
                  onClick={handleExportJSON}
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  {exporting ? 'Đang export...' : 'Export JSON'}
                </Button>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import dữ liệu
                </CardTitle>
                <CardDescription>
                  Tải lên dữ liệu vào bảng đã chọn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="w-full border-2 border-dashed rounded-lg p-4 hover:bg-accent/50 transition-colors text-center">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Import CSV</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click để chọn file CSV
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    disabled={importing}
                    className="hidden"
                  />
                </div>

                <div>
                  <Label htmlFor="json-upload" className="cursor-pointer">
                    <div className="w-full border-2 border-dashed rounded-lg p-4 hover:bg-accent/50 transition-colors text-center">
                      <FileJson className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Import JSON</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click để chọn file JSON
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="json-upload"
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    disabled={importing}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-2">Hướng dẫn sử dụng:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Export: Tải xuống toàn bộ dữ liệu từ bảng đã chọn</li>
                <li>Import: File phải khớp với cấu trúc bảng trong database</li>
                <li>CSV: Dòng đầu tiên phải là tên các cột</li>
                <li>JSON: File phải chứa một mảng các object</li>
                <li>Dữ liệu import sẽ được thêm vào bảng (không ghi đè)</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
