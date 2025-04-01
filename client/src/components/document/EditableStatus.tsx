import { StatusType } from "@/hooks/useDocumentEditing";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function EditableStatus({ 
  status, 
  isEditing, 
  onStartEdit, 
  onSelect 
}: EditableStatusProps) {
  // Format status label (e.g., convert "in-review" to "In Review")
  const formatStatusLabel = (status: StatusType): string => {
    return status === "in-review" 
      ? "In Review" 
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isEditing) {
    return (
      <DropdownMenu open={true} onOpenChange={(open) => !open && onStartEdit()}>
        <DropdownMenuTrigger asChild>
          <Badge variant="outline" className={getStatusBadge(status)}>
            {formatStatusLabel(status)}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onSelect("draft")}>
            <Badge variant="outline" className={getStatusBadge("draft")}>Draft</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect("in-progress")}>
            <Badge variant="outline" className={getStatusBadge("in-progress")}>In Progress</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect("in-review")}>
            <Badge variant="outline" className={getStatusBadge("in-review")}>In Review</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect("complete")}>
            <Badge variant="outline" className={getStatusBadge("complete")}>Complete</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect("archived")}>
            <Badge variant="outline" className={getStatusBadge("archived")}>Archived</Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`${getStatusBadge(status)} cursor-pointer`}
      onDoubleClick={onStartEdit}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}