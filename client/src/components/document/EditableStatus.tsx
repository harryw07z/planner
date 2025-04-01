import { StatusType } from "@/hooks/useDocumentEditing";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface EditableStatusProps {
  status: StatusType;
  isEditing: boolean;
  onStartEdit: () => void;
  onSelect: (status: StatusType) => void;
}

// Status configuration with enhanced descriptions and visual cues
const STATUS_CONFIG = {
  "draft": {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hoverColor: "hover:bg-yellow-200",
    icon: "📝",
    description: "Initial draft version"
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    hoverColor: "hover:bg-blue-200",
    icon: "🔄",
    description: "Currently being worked on"
  },
  "in-review": {
    label: "In Review",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    hoverColor: "hover:bg-purple-200",
    icon: "👀",
    description: "Under review by team members"
  },
  "complete": {
    label: "Complete",
    color: "bg-green-100 text-green-800 border-green-200",
    hoverColor: "hover:bg-green-200",
    icon: "✅",
    description: "Finalized and approved"
  },
  "archived": {
    label: "Archived",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    hoverColor: "hover:bg-gray-200",
    icon: "🗄️", 
    description: "Stored for reference"
  }
};

export function EditableStatus({ 
  status, 
  isEditing, 
  onStartEdit, 
  onSelect 
}: EditableStatusProps) {
  const [isOpen, setIsOpen] = useState(isEditing);
  
  // Get current status config
  const currentStatus = STATUS_CONFIG[status];

  if (isEditing) {
    return (
      <div className="relative z-50">
        <DropdownMenu open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) onSelect(status);
        }}>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full gap-1.5 text-sm cursor-pointer shadow-sm",
              "border border-transparent transition-colors",
              currentStatus.color
            )}>
              <span>{currentStatus.icon}</span>
              <span>{currentStatus.label}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48 p-1.5">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem 
                key={key}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer mb-1",
                  status === key ? config.color : "",
                  status !== key ? config.hoverColor : ""
                )}
                onClick={() => onSelect(key as StatusType)}
              >
                <span className="text-base mr-1">{config.icon}</span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{config.description}</span>
                </div>
                {status === key && (
                  <Check className="h-4 w-4 ml-auto text-green-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  // Display mode with single-click edit and tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full gap-1.5 text-sm cursor-pointer",
              "border border-transparent transition-colors",
              currentStatus.color,
              currentStatus.hoverColor
            )}
            onClick={onStartEdit} // Changed to single-click for easier access
          >
            <span>{currentStatus.icon}</span>
            <span>{currentStatus.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-xs p-2">
          <p>{currentStatus.description}</p>
          <p className="text-gray-500 mt-1">Click to change status</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}