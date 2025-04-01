import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { StatusType, PriorityType } from '@/hooks/useDocumentEditing';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
import { EditableTagsSimple } from './EditableTagsSimple';
import { EditableTitle } from './EditableTitle';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, SortAsc, X } from "lucide-react";
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

  // Get visible columns and manage dragging state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visibleColumnsState, setVisibleColumnsState] = useState<ColumnType[]>([]);
  
  // Get visible columns from props
  const visibleColumns = columns.filter(column => column.visible);
  
  // Update visible columns state when columns prop changes
  useEffect(() => {
    setVisibleColumnsState(visibleColumns);
  }, [columns, visibleColumns]);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = visibleColumnsState.findIndex(col => col.id === active.id);
      const newIndex = visibleColumnsState.findIndex(col => col.id === over.id);
      
      // Reorder columns
      const newColumns = arrayMove(visibleColumnsState, oldIndex, newIndex);
      setVisibleColumnsState(newColumns);
      
      // You could add a callback here to persist column order if needed
      console.log("Column order changed:", newColumns.map(col => col.name).join(', '));
    }
    
    setActiveId(null);
  }, [visibleColumnsState]);

  // Sortable header cell component
  const SortableHeaderCell = memo(({ column }: { column: ColumnType }) => {
    const isSortable = ["title", "updatedAt", "createdAt", "priority", "dueDate"].includes(column.key);
    const isSorted = sortField === column.key;
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: column.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      width: column.width,
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.8 : 1,
    };
    
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex items-center h-full whitespace-nowrap",
          isDragging && "bg-gray-100 shadow-md rounded"
        )}
        {...attributes}
        {...listeners}
      >
        <div 
          className={cn(
            "flex items-center gap-1 text-xs font-medium text-gray-500 px-4 py-2 select-none whitespace-nowrap w-full",
            isSortable && "cursor-pointer hover:text-gray-700"
          )}
          onClick={(e) => {
            // Prevent column reordering when clicking to sort
            e.stopPropagation();
            if (isSortable) onToggleSort(column.key);
          }}
        >
          {column.name}
          {isSorted && (
            <SortAsc className={`h-3.5 w-3.5 ml-1 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
          )}
        </div>
        
        {/* Resizer */}
        <div 
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-gray-300"
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent drag from starting when resizing
            handleResizeStart(e, column.id, column.width);
          }}
        ></div>
      </div>
    );
  });
  
  SortableHeaderCell.displayName = 'SortableHeaderCell';

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
      <EditableTagsSimple
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
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatDate(new Date(document[key]))}
          </span>
        );
        
      default:
        if (document.custom && document.custom[key as keyof typeof document.custom]) {
          return (
            <span className="text-sm text-gray-700 whitespace-nowrap">
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
        className="flex items-center min-h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors whitespace-nowrap"
        onClick={() => onDocumentSelect(document.id)}
      >
        {visibleColumnsState.map(column => (
          <div 
            key={column.id} 
            className="flex items-center px-3 py-2 overflow-hidden whitespace-nowrap text-ellipsis"
            style={{ width: column.width }}
            onClick={(e) => {
              // Prevent row click when clicking on a cell that handles its own clicks
              if (column.key === "title" || column.key === "tags" || 
                  column.key === "status" || column.key === "priority" ||
                  column.key === "assignedTo" || column.key === "dueDate") {
                e.stopPropagation();
              }
            }}
          >
            {renderCellContent(document, column)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white" ref={tableRef}>
      {/* Table Header with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveId(event.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-10 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <SortableContext 
            items={visibleColumnsState.map(col => col.id)} 
            strategy={horizontalListSortingStrategy}
          >
            {visibleColumnsState.map(column => (
              <SortableHeaderCell key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      
      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {documents.length > 0 ? (
          documents.map(renderDocumentRow)
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No documents found
          </div>
        )}
      </div>
      
      {/* Visual affordance for dragging */}
      <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-b-lg border-t border-blue-100">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded-sm text-blue-700 font-medium text-xs">Tip</div>
          <div>Drag and drop column headers to rearrange columns</div>
        </div>
      </div>
    </div>
  );
});

DocumentTable.displayName = 'DocumentTable';