"use client";
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCompareStore } from '@/stores/compareStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  X,
  Plus,
  Check,
  Minus,
  Trophy,
  MapPin,
  Building2,
  ArrowRight,
  Trash2,
  AlertCircle,
  Search,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

import SEOHead from '@/components/seo/SEOHead';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Project } from '@/types/project';
import { projectsData } from '@/data/projectsData';

// --- Smart Add Modal Component ---
const AddProjectModal = ({ 
  open, 
  onOpenChange, 
  currentIds, 
  onAdd 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  currentIds: string[]; 
  onAdd: (project: Project) => void; 
}) => {
  const [search, setSearch] = useState('');

  const availableProjects = useMemo(() => {
    return projectsData.filter(p => 
      !currentIds.includes(p.id) && 
      (p.name.toLowerCase().includes(search.toLowerCase()) || 
       p.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, currentIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col bg-card text-card-foreground border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle>Thêm dự án để so sánh</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm tên dự án, vị trí..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border focus:bg-background"
            />
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-2">
          <div className="grid gap-2">
            {availableProjects.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Không tìm thấy dự án phù hợp
              </div>
            ) : (
              availableProjects.map(project => (
                <div 
                  key={project.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                  onClick={() => {
                    onAdd(project);
                    onOpenChange(false);
                    setSearch('');
                  }}
                >
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    <img loading="lazy" decoding="async" src={project.image} alt={project.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-foreground">{project.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{project.location}</p>
                  </div>
                  <Button size="sm" variant="secondary" className="h-8 px-3 ml-auto">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const Compare = () => {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [hideSimilar, setHideSimilar] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Helper Functions ---

  const getBestValue = (key: string, projects: Project[]) => {
    if (projects.length < 2) return null;
    
    if (key === 'pricePerSqm') {
      const prices = projects.map(p => p.pricePerSqm).filter(p => p > 0);
      return Math.min(...prices);
    }
    if (key === 'legalScore' || key === 'rentalYield') {
      const scores = projects.map(p => p[key as keyof Project] as number).filter(s => s > 0);
      return Math.max(...scores);
    }
    return null;
  };

  // --- Configuration ---

  const comparisonGroups = [
    {
      id: 'overview',
      label: 'Tổng quan',
      fields: [
        { key: 'location', label: 'Vị trí', type: 'text' },
        { key: 'developer', label: 'Chủ đầu tư', type: 'text' },
        { key: 'status', label: 'Trạng thái', type: 'badge' },
        { key: 'completionDate', label: 'Bàn giao', type: 'text' },
      ]
    },
    {
      id: 'financial',
      label: 'Tài chính & Đầu tư',
      fields: [
        { key: 'pricePerSqm', label: 'Giá bán / m²', type: 'price', highlightWinner: true },
        { key: 'priceRange', label: 'Tổng giá', type: 'text' },
        { key: 'rentalYield', label: 'Lợi nhuận thuê', type: 'percent', highlightWinner: true },
      ]
    },
    {
      id: 'legal',
      label: 'Pháp lý & Quy mô',
      fields: [
        { key: 'legalScore', label: 'Điểm pháp lý', type: 'score', highlightWinner: true },
        { key: 'totalUnits', label: 'Tổng số căn', type: 'number' },
        { key: 'floors', label: 'Số tầng', type: 'text' },
      ]
    }
  ];

  // --- Render Helpers ---

  const renderCellContent = (project: Project, field: any, isBest: boolean) => {
    const value = project[field.key as keyof Project];

    if (value === undefined || value === null) return <span className="text-muted-foreground">-</span>;

    let content;
    switch (field.type) {
      case 'price':
        content = <span className="font-bold text-primary">{formatCurrency(Number(value))}</span>;
        break;
      case 'percent':
        content = value ? <span className="font-medium text-emerald-600 dark:text-emerald-400">{String(value)}%</span> : '-';
        break;
      case 'score':
        content = (
            <Badge 
                variant="outline"
                className={`
                    ${Number(value) >= 8 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                        : Number(value) >= 6 
                            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400' 
                            : 'border-destructive/30 bg-destructive/10 text-destructive'}
                `}
            >
                {String(value)}/10
            </Badge>
        );
        break;
      case 'badge':
        const statusMap: any = { good: 'Tốt', warning: 'Cảnh báo', danger: 'Rủi ro' };
        const colorMap: any = { 
            good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 
            warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
            danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
        };
        content = (
            <Badge className={`${colorMap[value as string]} hover:${colorMap[value as string]} border-0`}>
                {statusMap[value as string] || value}
            </Badge>
        );
        break;
      case 'number':
        content = <span className="text-foreground">{Number(value).toLocaleString('vi-VN')}</span>;
        break;
      default:
        content = <span className="line-clamp-2 text-foreground" title={String(value)}>{String(value)}</span>;
    }

    return (
      <div className="flex items-center justify-center gap-2 w-full">
        {content}
        {isBest && (
          <div className="absolute top-0 right-0 p-1">
            <Trophy className="w-3 h-3 text-yellow-500 fill-yellow-500 dark:text-yellow-400" />
          </div>
        )}
      </div>
    );
  };

  // --- Content ---

  const emptyState = (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-full shadow-inner">
        <Building2 className="h-20 w-20 text-blue-500/50 dark:text-blue-400/50" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">So sánh dự án</h1>
        <p className="text-muted-foreground">
          Chọn tối đa 4 dự án để so sánh chi tiết về giá, pháp lý và tiềm năng sinh lời.
        </p>
      </div>
      <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <Plus className="mr-2 h-5 w-5" />
        Thêm dự án ngay
      </Button>
    </div>
  );

  if (compareList.length === 0) {
    if (isMobile) {
      return (
        <div className="min-h-screen bg-background p-4 pb-20">
          {emptyState}
          <BottomNavigation />
        </div>
      );
    }
    return (
      <DesktopLayout title="So sánh dự án">
        <SEOHead title="So sánh dự án - Realprofit.vn" description="So sánh chi tiết các dự án bất động sản" />
        {emptyState}
      </DesktopLayout>
    );
  }

  const content = (
    <div className="space-y-6 h-full flex flex-col max-w-full overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            So sánh dự án 
            <Badge variant="secondary" className="rounded-full px-2.5 bg-secondary text-secondary-foreground">{compareList.length}/4</Badge>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="hide-similar" checked={hideSimilar} onCheckedChange={setHideSimilar} />
            <Label htmlFor="hide-similar" className="text-sm cursor-pointer text-foreground">Chỉ hiện điểm khác</Label>
          </div>
          
          <div className="h-6 w-px bg-border hidden sm:block"></div>
          
          <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCompare} 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={compareList.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa hết
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="hidden sm:flex shadow-sm" disabled={compareList.length >= 4}>
              <Plus className="mr-2 h-4 w-4" /> Thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <ScrollArea className="w-full border border-border rounded-2xl bg-card shadow-sm flex-1">
        <div className="min-w-max">
          {/* 1. Sticky Header Row (Project Cards) */}
          <div className="flex sticky top-0 z-20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border shadow-sm">
            {/* Top-Left Empty Cell */}
            <div className="w-40 sm:w-56 p-4 font-bold bg-muted/30 dark:bg-muted/10 border-r border-border flex items-center text-foreground sticky left-0 z-30">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Tiêu chí so sánh</span>
            </div>

            {/* Project Columns */}
            {compareList.map((project) => (
              <div key={project.id} className="w-56 sm:w-72 p-4 border-r border-border last:border-r-0 relative group transition-colors hover:bg-muted/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all bg-background/80 hover:bg-destructive hover:text-white shadow-sm z-10"
                  onClick={() => removeFromCompare(project.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="flex flex-col h-full">
                  <div 
                    className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-muted relative cursor-pointer group/img border border-border"
                    onClick={() => navigate.push(`/projects/${project.id}`)}
                  >
                    {project.image ? (
                      <img loading="lazy" decoding="async" src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><Building2 className="h-8 w-8 opacity-20" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                  </div>
                  
                  <h3 
                    className="font-bold text-base line-clamp-2 mb-1 cursor-pointer hover:text-primary text-foreground leading-tight"
                    onClick={() => navigate.push(`/projects/${project.id}`)}
                  >
                    {project.name}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{project.district}</span>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-auto rounded-lg border-primary/20 text-primary hover:bg-primary/5 dark:hover:bg-primary/20 hover:text-primary"
                    onClick={() => navigate.push(`/projects/${project.id}`)}
                  >
                    Chi tiết <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}

            {/* "Add Project" Slot */}
            {compareList.length < 4 && (
              <div className="w-56 sm:w-72 p-4 flex flex-col items-center justify-center text-muted-foreground gap-3 cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors border-r border-transparent min-h-[260px]"
                   onClick={() => setIsAddModalOpen(true)}>
                <div className="h-16 w-16 rounded-full bg-muted/50 dark:bg-muted/20 flex items-center justify-center group-hover:scale-110 transition-transform border border-dashed border-border">
                  <Plus className="h-8 w-8 opacity-50" />
                </div>
                <span className="text-sm font-medium">Thêm dự án</span>
              </div>
            )}
          </div>

          {/* 2. Data Rows */}
          <div className="divide-y divide-border">
            {comparisonGroups.map((group) => (
              <div key={group.id}>
                {/* Group Header */}
                <div className="sticky left-0 z-10 bg-muted/20 dark:bg-muted/10 font-bold text-xs uppercase tracking-wider text-primary px-4 py-2 border-b border-border w-full backdrop-blur-sm">
                  {group.label}
                </div>

                {/* Fields in Group */}
                {group.fields.map((field) => {
                  // Check for differences if "Hide Similar" is active
                  const values = compareList.map(p => p[field.key as keyof Project]);
                  const isUnique = new Set(values.map(String)).size > 1;
                  if (hideSimilar && !isUnique) return null;

                  // Explicit casts for TS
                  const bestValue = field.highlightWinner ? getBestValue(field.key, compareList as unknown as Project[]) : null;

                  return (
                    <div key={field.key} className="flex hover:bg-muted/5 dark:hover:bg-muted/5 transition-colors">
                      {/* Label Column (Sticky Left) */}
                      <div className="w-40 sm:w-56 p-4 text-sm font-medium text-muted-foreground bg-card/95 dark:bg-card/95 backdrop-blur border-r border-border flex items-center gap-2 sticky left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none">
                        <span className="truncate">{field.label}</span>
                        {field.key === 'legalScore' && <AlertCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" />}
                      </div>
                      
                      {/* Data Columns */}
                      {compareList.map((project) => {
                        const val = project[field.key as keyof Project];
                        const isBest = bestValue !== null && val === bestValue;
                        
                        return (
                          <div key={project.id} className={`w-56 sm:w-72 p-4 text-sm border-r border-border flex items-center justify-center text-center relative ${isBest ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                            {renderCellContent(project as unknown as Project, field, isBest)}
                          </div>
                        );
                      })}
                      
                      {/* Empty Slot Spacer */}
                      {compareList.length < 4 && <div className="w-56 sm:w-72" />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Add Project Modal */}
      <AddProjectModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        currentIds={compareList.map(p => p.id)}
        onAdd={(p) => addToCompare(p as any)}
      />

      {/* Mobile Tip */}
      {isMobile && compareList.length > 0 && (
        <div className="text-center text-xs text-muted-foreground animate-pulse pb-4">
          Vuốt ngang để xem thêm dự án
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <SEOHead title="So sánh dự án" description="So sánh chi tiết các dự án bất động sản" />
        {content}
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="So sánh dự án">
      <SEOHead title="So sánh dự án" description="So sánh chi tiết các dự án bất động sản" />
      {content}
    </DesktopLayout>
  );
};

export default Compare;