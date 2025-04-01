import { PriorityType } from "@/hooks/useDocumentEditing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PriorityProps = {
  priority: PriorityType | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onSelect: (priority: PriorityType | null) => void;
};

// Priority badge styling helper
const getPriorityBadge = (priority: PriorityType | null): string => {
  if (!priority) return "bg-gray-100 text-gray-600";
  
  switch (priority) {
    case "low":
      return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200";
    case "high":
      return "bg-red-50 text-red-700 hover:bg-red-100 border-red-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export function EditablePriority({ 
  priority, 
  isEditing, 
  onStartEdit, 
  onSelect 
}: PriorityProps) {
  // Helper function to capitalize first letter
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  
  if (isEditing) {
    return (
      <Popover open={true} onOpenChange={(open) => !open && onSelect(priority)}>
        <PopoverTrigger asChild>
          <Badge variant="outline" className={`${getPriorityBadge(priority || "low")}`}>
            {priority ? capitalize(priority) : "None"}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Badge>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-2">
          <div className="flex flex-col gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex justify-start h-8 px-2 text-xs" 
              onClick={() => onSelect("low")}
            >
              <Badge variant="outline" className={getPriorityBadge("low")}>Low</Badge>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex justify-start h-8 px-2 text-xs" 
              onClick={() => onSelect("medium")}
            >
              <Badge variant="outline" className={getPriorityBadge("medium")}>Medium</Badge>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex justify-start h-8 px-2 text-xs" 
              onClick={() => onSelect("high")}
            >
              <Badge variant="outline" className={getPriorityBadge("high")}>High</Badge>
            </Button>
            <Separator className="my-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex justify-start h-8 px-2 text-xs text-gray-500" 
              onClick={() => onSelect(null)}
            >
              <X className="h-3.5 w-3.5 mr-1.5" /> Remove priority
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return priority ? (
    <Badge 
      variant="outline" 
      className={`${getPriorityBadge(priority)} cursor-pointer`}
      onDoubleClick={onStartEdit}
    >
      {capitalize(priority)}
    </Badge>
  ) : (
    <span 
      className="text-gray-400 text-xs cursor-pointer"
      onDoubleClick={onStartEdit}
    >
      Set priority
    </span>
  );
}