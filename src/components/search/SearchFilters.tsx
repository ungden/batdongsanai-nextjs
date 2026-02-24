"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  onApplyFilters: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters = ({ onApplyFilters, isOpen, onToggle }: SearchFiltersProps) => {
  const [filters, setFilters] = useState({
    location: "",
    projectType: "",
    priceRange: "",
    legalStatus: "",
    developer: "",
    completionYear: "",
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    
    if (value && !activeFilters.includes(key)) {
      setActiveFilters([...activeFilters, key]);
    } else if (!value && activeFilters.includes(key)) {
      setActiveFilters(activeFilters.filter(f => f !== key));
    }
  };

  const removeFilter = (key: string) => {
    setFilters({ ...filters, [key]: "" });
    setActiveFilters(activeFilters.filter(f => f !== key));
  };

  const clearAllFilters = () => {
    setFilters({
      location: "",
      projectType: "",
      priceRange: "",
      legalStatus: "",
      developer: "",
      completionYear: "",
    });
    setActiveFilters([]);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onToggle();
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" onClick={onToggle} className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Bộ lọc
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
        
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filterKey) => (
              <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                {filterKey}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter(filterKey)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Bộ lọc tìm kiếm</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Địa điểm</Label>
          <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hanoi">Hà Nội</SelectItem>
              <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
              <SelectItem value="danang">Đà Nẵng</SelectItem>
              <SelectItem value="haiphong">Hải Phòng</SelectItem>
              <SelectItem value="cantho">Cần Thơ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectType">Loại hình</Label>
          <Select value={filters.projectType} onValueChange={(value) => handleFilterChange("projectType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Căn hộ</SelectItem>
              <SelectItem value="house">Nhà phố</SelectItem>
              <SelectItem value="villa">Biệt thự</SelectItem>
              <SelectItem value="townhouse">Shophouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceRange">Khoảng giá</Label>
          <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khoảng giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-2">Dưới 2 tỷ</SelectItem>
              <SelectItem value="2-5">2-5 tỷ</SelectItem>
              <SelectItem value="5-10">5-10 tỷ</SelectItem>
              <SelectItem value="over-10">Trên 10 tỷ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalStatus">Tình trạng pháp lý</Label>
          <Select value={filters.legalStatus} onValueChange={(value) => handleFilterChange("legalStatus", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complete">Đầy đủ</SelectItem>
              <SelectItem value="partial">Chưa đầy đủ</SelectItem>
              <SelectItem value="risky">Có rủi ro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="developer">Chủ đầu tư</Label>
          <Input
            id="developer"
            placeholder="Tên chủ đầu tư"
            value={filters.developer}
            onChange={(e) => handleFilterChange("developer", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="completionYear">Năm hoàn thành</Label>
          <Select value={filters.completionYear} onValueChange={(value) => handleFilterChange("completionYear", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6">
        <Button onClick={applyFilters} className="flex-1">
          Áp dụng bộ lọc
        </Button>
        <Button variant="outline" onClick={clearAllFilters}>
          Xóa tất cả
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;