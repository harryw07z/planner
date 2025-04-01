import { ReactNode, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface EditableCellProps {
  isEditing: boolean;
  editComponent: ReactNode;
  displayComponent: ReactNode;
  onDoubleClick: () => void;
  className?: string;
  tooltipContent?: ReactNode;
}

export function EditableCell({
  isEditing,
  editComponent,
  displayComponent,
  onDoubleClick,
  className = "",
  tooltipContent
}: EditableCellProps) {
  // If tooltip is provided, wrap in tooltip, otherwise render directly
  if (isEditing) {
    return editComponent;
  }

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`cursor-pointer ${className}`}
              onDoubleClick={onDoubleClick}
            >
              {displayComponent}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div 
      className={`cursor-pointer ${className}`}
      onDoubleClick={onDoubleClick}
    >
      {displayComponent}
    </div>
  );
}

// Specialized badge cells
interface BadgeCellProps {
  text: string;
  badgeClass: string;
  onDoubleClick: () => void;
}

export function BadgeCell({ text, badgeClass, onDoubleClick }: BadgeCellProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${badgeClass} cursor-pointer`}
      onDoubleClick={onDoubleClick}
    >
      {text}
    </Badge>
  );
}

// Specialized empty state cell
interface EmptyStateCellProps {
  text: string;
  onDoubleClick: () => void;
}

export function EmptyStateCell({ text, onDoubleClick }: EmptyStateCellProps) {
  return (
    <span 
      className="text-gray-400 text-xs cursor-pointer"
      onDoubleClick={onDoubleClick}
    >
      {text}
    </span>
  );
}