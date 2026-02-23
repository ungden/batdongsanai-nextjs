"use client";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface FilterTag {
  id: string;
  label: string;
  category: string;
}

interface FilterTagsProps {
  selectedTags: FilterTag[];
  onRemoveTag: (tagId: string) => void;
  onClearAll: () => void;
}

const FilterTags = ({ selectedTags, onRemoveTag, onClearAll }: FilterTagsProps) => {
  if (selectedTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Đang lọc:
      </span>
      <ScrollArea className="flex-1">
        <div className="flex gap-2 pb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => onRemoveTag(tag.id)}
            >
              {tag.label}
              <X className="w-3 h-3 ml-1.5" />
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Badge
        variant="outline"
        className="px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors whitespace-nowrap"
        onClick={onClearAll}
      >
        Xóa tất cả
        <X className="w-3 h-3 ml-1.5" />
      </Badge>
    </div>
  );
};

export default FilterTags;