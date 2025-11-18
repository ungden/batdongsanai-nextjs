"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface QuickFilter {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  selectedFilters: string[];
  onToggleFilter: (filterId: string) => void;
}

const QuickFilters = ({ filters, selectedFilters, onToggleFilter }: QuickFiltersProps) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          return (
            <Button
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleFilter(filter.id)}
              className={`
                rounded-full px-4 py-2 h-auto whitespace-nowrap font-medium text-xs
                ${isSelected 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/50"
                }
              `}
            >
              {filter.icon && <span className="mr-1.5">{filter.icon}</span>}
              {filter.label}
              {filter.count !== undefined && (
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className="ml-2 text-[10px] px-1.5 py-0"
                >
                  {filter.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default QuickFilters;