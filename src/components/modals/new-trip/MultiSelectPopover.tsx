
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";

interface MultiSelectPopoverProps {
  label: string;
  options: string[];
  selectedItems: string[];
  onItemSelect: (item: string) => void;
  onItemRemove: (item: string) => void;
  placeholder: string;
}

const MultiSelectPopover = ({
  label,
  options,
  selectedItems,
  onItemSelect,
  onItemRemove,
  placeholder,
}: MultiSelectPopoverProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleItemToggle = (item: string) => {
    if (selectedItems.includes(item)) {
      onItemRemove(item);
    } else {
      onItemSelect(item);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal mt-1"
          >
            {selectedItems.length > 0
              ? `${selectedItems.length} ${t("trips.newTripModal.multiSelect.selected")}`
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-3 space-y-2">
            {options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={selectedItems.includes(option) ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleItemToggle(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedItems.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {item}
              <X
                size={14}
                className="cursor-pointer hover:text-red-500"
                onClick={() => onItemRemove(item)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectPopover;
