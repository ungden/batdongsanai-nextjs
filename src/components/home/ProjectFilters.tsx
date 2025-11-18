import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

interface ProjectFiltersProps {
  onSearchChange: (search: string) => void;
  onLocationFilter: (location: string) => void;
  onTypeFilter: (type: string) => void;
  onPriceFilter: (price: string) => void;
  onSortChange: (sort: string) => void;
  activeFilters: {
    search: string;
    location: string;
    type: string;
    price: string;
    sort: string;
  };
}

const ProjectFilters = ({
  onSearchChange,
  onLocationFilter,
  onTypeFilter,
  onPriceFilter,
  onSortChange,
  activeFilters
}: ProjectFiltersProps) => {
  const locationOptions = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Bình Dương"];

  return (
    <div className="bg-white/80 backdrop-blur-xl py-4 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search - prominent position */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              value={activeFilters.search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Location Pills - horizontal */}
          <div className="flex flex-wrap gap-2">
            {locationOptions.slice(0, 4).map((location) => (
              <button
                key={location}
                onClick={() => onLocationFilter(location === activeFilters.location ? "" : location)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${
                  activeFilters.location === location
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-primary/30"
                }`}
              >
                {location}
              </button>
            ))}
          </div>

          {/* Compact Filter Dropdowns */}
          <div className="flex gap-2">
            <Select value={activeFilters.price} onValueChange={onPriceFilter}>
              <SelectTrigger className="w-32 h-10 text-sm rounded-xl border-2 border-slate-200 shadow-sm">
                <SelectValue placeholder="Giá" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tất cả giá</SelectItem>
                <SelectItem value="under-5">Dưới 5 tỷ</SelectItem>
                <SelectItem value="5-10">5-10 tỷ</SelectItem>
                <SelectItem value="over-10">Trên 10 tỷ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeFilters.sort} onValueChange={onSortChange}>
              <SelectTrigger className="w-36 h-10 text-sm rounded-xl border-2 border-slate-200 shadow-sm">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-low">Giá thấp</SelectItem>
                <SelectItem value="price-high">Giá cao</SelectItem>
                <SelectItem value="legal-score">Pháp lý tốt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;