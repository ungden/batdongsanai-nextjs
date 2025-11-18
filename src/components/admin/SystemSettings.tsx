
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

interface SystemSettingsProps {
  settings: SystemSetting[];
  onUpdate: (key: string, value: any, description?: string) => void;
}

const SystemSettings = ({ settings, onUpdate }: SystemSettingsProps) => {
  const [editingSettings, setEditingSettings] = useState<Record<string, any>>({});

  const handleSettingChange = (key: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (setting: SystemSetting) => {
    const newValue = editingSettings[setting.key] !== undefined 
      ? editingSettings[setting.key] 
      : setting.value;
    
    onUpdate(setting.key, newValue, setting.description || undefined);
    
    // Remove from editing settings
    setEditingSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[setting.key];
      return newSettings;
    });
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = editingSettings[setting.key] !== undefined 
      ? editingSettings[setting.key] 
      : setting.value;

    // Handle boolean values
    if (typeof setting.value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
          />
          <Label>{currentValue ? 'Bật' : 'Tắt'}</Label>
        </div>
      );
    }

    // Handle string values that look like JSON strings
    if (typeof setting.value === 'string' && setting.value.startsWith('"') && setting.value.endsWith('"')) {
      const stringValue = setting.value.slice(1, -1);
      const currentStringValue = typeof currentValue === 'string' && currentValue.startsWith('"') && currentValue.endsWith('"')
        ? currentValue.slice(1, -1)
        : currentValue;

      return (
        <Input
          value={currentStringValue}
          onChange={(e) => handleSettingChange(setting.key, `"${e.target.value}"`)}
          placeholder="Nhập giá trị..."
        />
      );
    }

    // Handle numbers
    if (typeof setting.value === 'number' || !isNaN(Number(setting.value))) {
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
          placeholder="Nhập số..."
        />
      );
    }

    // Handle text values
    if (setting.key.includes('description') || setting.key.includes('message')) {
      return (
        <Textarea
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          placeholder="Nhập mô tả..."
          rows={3}
        />
      );
    }

    // Default to text input
    return (
      <Input
        value={currentValue}
        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
        placeholder="Nhập giá trị..."
      />
    );
  };

  const formatKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt hệ thống</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="border rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    {formatKey(setting.key)}
                  </Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {renderSettingInput(setting)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Cập nhật lần cuối: {new Date(setting.updated_at).toLocaleString('vi-VN')}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSave(setting)}
                    disabled={editingSettings[setting.key] === undefined}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {settings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không có cài đặt nào
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
