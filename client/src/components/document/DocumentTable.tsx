import { useState, useRef, useEffect, memo } from 'react';
import { StatusType, PriorityType } from '@/hooks/useDocumentEditing';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Simplified DocumentWithMetadata interface to avoid schema import
interface DocumentCustom {
  createdBy: string;
  wordCount: number;
  estimatedReadTime: string;
  lastEdited: string;
  lastEditedBy: string;
  comments: number;
}

interface DocumentWithMetadata {
  id: number;
  title: string;
  content: string | null;
  projectId: number;
  emoji: string;
  status: StatusType;
  priority: PriorityType;
  tags: string[];
  favorite: boolean;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  custom?: DocumentCustom;
};
import { formatDate } from "@/lib/utils";
import { useDocumentEditing } from '@/hooks/useDocumentEditing';
import { EditablePriority } from './EditablePriority';
import { EditableStatus } from './EditableStatus';
import { EditableTags } from './EditableTags';
import { EditableTitle } from './EditableTitle';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, SortAsc, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define column types
interface ColumnType {
  id: string;
  name: string;
  key: string;
  visible: boolean;
  width: number;
}

// Define document table props
interface DocumentTableProps {
  documents: DocumentWithMetadata[];
  columns: ColumnType[];
  onDocumentSelect: (documentId: number) => void;
  onFavoriteToggle: (documentId: number, e: React.MouseEvent) => void;
  onResizeColumn: (columnId: string, width: number) => void;
  onToggleSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  commonTags: string[];
  mockUsers: Array<{ id: number, name: string, initials: string }>;
  onStatusChange?: (documentId: number, newStatus: StatusType) => void;
}

export const DocumentTable = memo(({
  documents,
  columns,
  onDocumentSelect,
  onFavoriteToggle,
  onResizeColumn,
  onToggleSort,
  sortField,
  sortDirection,
  commonTags,
  mockUsers,
  onStatusChange
}: DocumentTableProps) => {
  // Get editable document hooks
  const {
    editingCell,
    editValue,
    editCellRef,
    setEditValue,
    startCellEdit,
    saveCellEdit,
    cancelCellEdit
  } = useDocumentEditing();

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Handle column resize start
  const handleResizeStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle column resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + deltaX); // Minimum width of 80px
    
    onResizeColumn(resizingColumn, newWidth);
  };

  // Handle column resize end
  const handleResizeEnd = () => {
    setResizingColumn(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Clean up resize event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // Get visible columns
  const visibleColumns = columns.filter(column => column.visible);

  // Render table header cell
  const renderTableHeaderCell = (column: ColumnType) => {
    const isSortable = ["title", "updatedAt", "createdAt", "priority", "dueDate"].includes(column.key);
    const isSorted = sortField === column.key;
    
    return (
      <div 
        key={column.id}
        className="group relative flex items-center h-full"
        style={{ width: column.width }}
      >
        <div 
          className={cn(
            "flex items-center gap-1 text-xs font-medium text-gray-500 px-4 py-2 select-none",
            isSortable && "cursor-pointer hover:text-gray-700"
          )}
          onClick={() => isSortable && onToggleSort(column.key)}
        >
          {column.name}
          {isSorted && (
            <SortAsc className={`h-3.5 w-3.5 ml-1 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
          )}
        </div>
        
        {/* Resizer */}
        <div 
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-gray-300"
          onMouseDown={(e) => handleResizeStart(e, column.id, column.width)}
        ></div>
      </div>
    );
  };

  // Render title cell
  const renderTitleCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "title";
    
    return (
      <EditableTitle
        title={document.title}
        emoji={document.emoji || "📄"}
        isEditing={isEditing}
        onStartEdit={() => startCellEdit(document.id, "title", document.title)}
        onSave={(value) => saveCellEdit(document.id, "title", value)}
        onNavigate={() => onDocumentSelect(document.id)}
      />
    );
  };

  // Render status cell
  const renderStatusCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "status";
    
    return (
      <EditableStatus
        status={document.status}
        isEditing={isEditing}
        onStartEdit={() => startCellEdit(document.id, "status", document.status)}
        onSelect={(value) => {
          console.log(`Status selection: ${document.status} → ${value}`);
          if (value !== document.status) {
            // Update document with new status
            apiRequest('PUT', `/api/documents/${document.id}`, { status: value })
              .then((res: Response) => {
                if (res.ok) {
                  console.log(`Status updated to ${value} successfully`);
                  
                  // Force immediate refresh of all document data
                  queryClient.refetchQueries({ 
                    queryKey: ['/api/documents'],
                    exact: true, // Only refetch the exact query
                    type: 'active' // Only refetch queries that are currently active/mounted
                  });
                  
                  // Also manually update the document in the local UI while waiting for refetch
                  const updatedDocument = {...document, status: value};
                  // Notify parent components a change has occurred (optional)
                  if (onStatusChange) {
                    onStatusChange(document.id, value);
                  }
                } else {
                  console.error(`Error updating status: ${res.statusText}`);
                }
                return res.json();
              })
              .catch((err: Error) => console.error('Error updating status:', err));
          }
          cancelCellEdit();
        }}
      />
    );
  };

  // Render priority cell
  const renderPriorityCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "priority";
    
    return (
      <EditablePriority
        priority={document.priority}
        isEditing={isEditing}
        onStartEdit={() => startCellEdit(document.id, "priority", document.priority)}
        onSelect={(value) => saveCellEdit(document.id, "priority", value)}
      />
    );
  };

  // Render tags cell
  const renderTagsCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "tags";
    
    return (
      <EditableTags
        tags={document.tags}
        isEditing={isEditing}
        editValue={editValue || [...document.tags]}
        commonTags={commonTags}
        onStartEdit={() => startCellEdit(document.id, "tags", [...document.tags])}
        onSave={(value) => saveCellEdit(document.id, "tags", value)}
        onEditValueChange={setEditValue}
      />
    );
  };

  // Render assignee cell
  const renderAssigneeCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "assignee";
    
    if (isEditing) {
      return (
        <div ref={editCellRef}>
          <DropdownMenu open={true} onOpenChange={(open) => !open && cancelCellEdit()}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {document.assignedTo?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{document.assignedTo || 'Unassigned'}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {mockUsers.map((user) => (
                <DropdownMenuItem key={user.id} onClick={() => saveCellEdit(document.id, "assignedTo", user.name)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    
    return (
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onDoubleClick={() => startCellEdit(document.id, "assignedTo", document.assignedTo)}
      >
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {document.assignedTo?.split(' ').map(n => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{document.assignedTo || 'Unassigned'}</span>
      </div>
    );
  };

  // Render due date cell
  const renderDueDateCell = (document: DocumentWithMetadata) => {
    const isEditing = editingCell?.documentId === document.id && editingCell?.field === "dueDate";
    
    if (isEditing) {
      return (
        <div ref={editCellRef}>
          <Popover open={true} onOpenChange={(open) => !open && cancelCellEdit()}>
            <PopoverTrigger asChild>
              {document.dueDate ? (
                <div className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>{formatDate(new Date(document.dueDate))}</span>
                </div>
              ) : (
                <div className="text-gray-400 text-xs cursor-pointer">Set date</div>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={document.dueDate ? new Date(document.dueDate) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    saveCellEdit(document.id, "dueDate", date.toISOString());
                  } else {
                    saveCellEdit(document.id, "dueDate", null);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    
    return document.dueDate ? (
      <div 
        className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer"
        onDoubleClick={() => startCellEdit(document.id, "dueDate", document.dueDate)}
      >
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        <span>{formatDate(new Date(document.dueDate))}</span>
      </div>
    ) : (
      <span 
        className="text-gray-400 text-xs cursor-pointer"
        onDoubleClick={() => startCellEdit(document.id, "dueDate", document.dueDate)}
      >
        No date
      </span>
    );
  };

  // Render a cell based on its type
  const renderCellContent = (document: DocumentWithMetadata, column: ColumnType) => {
    const key = column.key;
    
    switch (key) {
      case "title":
        return renderTitleCell(document);
        
      case "status":
        return renderStatusCell(document);
        
      case "priority":
        return renderPriorityCell(document);
        
      case "tags":
        return renderTagsCell(document);
        
      case "assignedTo":
        return renderAssigneeCell(document);
        
      case "dueDate":
        return renderDueDateCell(document);
        
      case "updatedAt":
      case "createdAt":
        return (
          <span className="text-sm text-gray-500">
            {formatDate(new Date(document[key]))}
          </span>
        );
        
      default:
        if (document.custom && document.custom[key as keyof typeof document.custom]) {
          return (
            <span className="text-sm text-gray-700">
              {document.custom[key as keyof typeof document.custom]}
            </span>
          );
        }
        return null;
    }
  };

  // Render a document row
  const renderDocumentRow = (document: DocumentWithMetadata) => {
    return (
      <div 
        key={document.id} 
        className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        {visibleColumns.map(column => (
          <div 
            key={column.id} 
            className="flex items-center px-4 overflow-hidden"
            style={{ width: column.width }}
          >
            {renderCellContent(document, column)}
          </div>
        ))}
        
        <div className="flex gap-1 items-center ml-auto pr-4">
          <button 
            className={cn(
              "p-1.5 rounded-full transition-colors",
              document.favorite ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:text-yellow-500 hover:bg-gray-100"
            )}
            onClick={(e) => onFavoriteToggle(document.id, e)}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full" ref={tableRef}>
      {/* Table Header */}
      <div className="flex h-10 bg-gray-50 border-y border-gray-200 sticky top-0 z-10">
        {visibleColumns.map(renderTableHeaderCell)}
        <div className="w-12"></div>
      </div>
      
      {/* Table Body */}
      <div>
        {documents.map(renderDocumentRow)}
      </div>
    </div>
  );
});

DocumentTable.displayName = 'DocumentTable';