import { StatusType } from "@/hooks/useDocumentEditing";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface EditableStatusProps {
  status: StatusType;
  isEditing: boolean;
  onStartEdit: () => void;
  onSelect: (status: StatusType) => void;
}

// Status badge styling helper
const getStatusBadge = (status: StatusType): string => {
  switch (status) {
    case "draft":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "in-review":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "complete":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "archived":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format status label (e.g., convert "in-review" to "In Review")
const formatStatusLabel = (status: StatusType): string => {
  return status === "in-review" 
    ? "In Review" 
    : status === "in-progress"
      ? "In Progress"
      : status.charAt(0).toUpperCase() + status.slice(1);
};

export function EditableStatus({ 
  status, 
  isEditing, 
  onStartEdit, 
  onSelect 
}: EditableStatusProps) {
  const [isOpen, setIsOpen] = useState(isEditing);
  
  // Handle item selection
  const handleSelectStatus = (newStatus: StatusType) => {
    if (newStatus !== status) {
      console.log(`Changing status from ${status} to ${newStatus}`);
      onSelect(newStatus);
    }
    setIsOpen(false);
  };

  if (isEditing) {
    return (
      <div className="relative z-50">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <div className={`inline-flex items-center px-3 py-1 rounded-full gap-1 text-sm cursor-pointer ${getStatusBadge(status)}`}>
              {formatStatusLabel(status)}
              <ChevronDown className="h-3 w-3" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="z-50">
            <DropdownMenuItem className="cursor-pointer focus:bg-yellow-50" onClick={() => handleSelectStatus("draft")}>
              <div className={`px-3 py-1 rounded-full ${getStatusBadge("draft")}`}>Draft</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-blue-50" onClick={() => handleSelectStatus("in-progress")}>
              <div className={`px-3 py-1 rounded-full ${getStatusBadge("in-progress")}`}>In Progress</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-purple-50" onClick={() => handleSelectStatus("in-review")}>
              <div className={`px-3 py-1 rounded-full ${getStatusBadge("in-review")}`}>In Review</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-green-50" onClick={() => handleSelectStatus("complete")}>
              <div className={`px-3 py-1 rounded-full ${getStatusBadge("complete")}`}>Complete</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-50" onClick={() => handleSelectStatus("archived")}>
              <div className={`px-3 py-1 rounded-full ${getStatusBadge("archived")}`}>Archived</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer ${getStatusBadge(status)}`}
      onDoubleClick={onStartEdit}
    >
      {formatStatusLabel(status)}
    </div>
  );
}