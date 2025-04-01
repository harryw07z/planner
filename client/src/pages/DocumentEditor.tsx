import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  CalendarDays, 
  ArrowUpDown, 
  MoreHorizontal, 
  ChevronLeft,
  ChevronDown,
  Share,
  Save,
  Filter,
  SortAsc,
  Tag,
  Settings,
  X,
  Edit,
  Trash,
  Copy,
  Star,
  Clock,
  Users,
  PanelLeft,
  Layout,
  ImagePlus,
  LayoutGrid,
  LayoutList,
  GripVertical,
  Eye
} from "lucide-react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Define document status types
type StatusType = "draft" | "in-review" | "approved" | "archived";

// Define view types
type ViewType = "table" | "gallery" | "list";

// Define column types
type ColumnType = {
  id: string;
  name: string;
  key: keyof DocumentWithMetadata | keyof DocumentCustom;
  visible: boolean;
  width: number;
};

// Extended Document type with metadata
interface DocumentWithMetadata extends Document {
  status: StatusType;
  tags: string[];
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate?: string;
  icon?: string;
  favorite: boolean;
  emoji?: string;
}

// Document custom data type
interface DocumentCustom {
  createdBy: string;
  wordCount: number;
  estimatedReadTime: string;
  lastEdited: string;
  lastEditedBy: string;
  comments: number;
}

// Mock tags data
const mockTags = ["Product", "Feature", "UX", "Technical", "Marketing"];

// Mock users data
const mockUsers = [
  { id: 1, name: "Alex Johnson", avatar: "", initials: "AJ", email: "aj@example.com" },
  { id: 2, name: "Sarah Lee", avatar: "", initials: "SL", email: "sarah@example.com" },
  { id: 3, name: "David Kim", avatar: "", initials: "DK", email: "david@example.com" },
  { id: 4, name: "Emily Chen", avatar: "", initials: "EC", email: "emily@example.com" }
];

// Get status badge styling
const getStatusBadge = (status: StatusType) => {
  switch (status) {
    case "draft":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "in-review":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "archived":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get priority badge styling
const getPriorityBadge = (priority: "low" | "medium" | "high") => {
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

// Default columns for document table
const defaultColumns: ColumnType[] = [
  { id: "col-1", name: "Title", key: "title", visible: true, width: 300 },
  { id: "col-2", name: "Status", key: "status", visible: true, width: 120 },
  { id: "col-3", name: "Last Updated", key: "updatedAt", visible: true, width: 150 },
  { id: "col-4", name: "Tags", key: "tags", visible: true, width: 180 },
  { id: "col-5", name: "Priority", key: "priority", visible: true, width: 120 },
  { id: "col-6", name: "Assignee", key: "assignee", visible: true, width: 150 },
  { id: "col-7", name: "Due Date", key: "dueDate", visible: false, width: 120 },
  { id: "col-8", name: "Created At", key: "createdAt", visible: false, width: 150 },
  { id: "col-9", name: "Created By", key: "createdBy", visible: false, width: 150 },
  { id: "col-10", name: "Comments", key: "comments", visible: false, width: 100 },
];

// Document emoji options
const emojiOptions = [
  "📄", "📝", "📊", "📈", "📱", "💻", "🔍", "⚙️", "🚀", "💡", "🎯", "🏆", "🗂️", "📚", "📋"
];

// Random dates for demo
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const DocumentEditor = () => {
  // State for document data and editing
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState<string>("📄");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusType | null>(null);
  const [activePriority, setActivePriority] = useState<"low" | "medium" | "high" | null>(null);
  
  // State for table configuration
  const [columns, setColumns] = useState<ColumnType[]>(defaultColumns);
  const [viewType, setViewType] = useState<ViewType>("table");
  const [sortField, setSortField] = useState<keyof DocumentWithMetadata>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isColumnsDialogOpen, setIsColumnsDialogOpen] = useState(false);
  
  // Dialog states
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Default project ID for demo
  const projectId = 1;

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: () => apiRequest('GET', '/api/documents').then(res => res.json()),
  });

  // Add metadata to documents (mock data for demo)
  const documentsWithMetadata: DocumentWithMetadata[] = documents?.map((doc: Document, index: number) => {
    // Random date from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const dueDate = index % 3 === 0 ? getRandomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 2))) : undefined;
    
    return {
      ...doc,
      status: doc.id % 4 === 0 ? "approved" : doc.id % 3 === 0 ? "in-review" : doc.id % 2 === 0 ? "archived" : "draft",
      tags: [
        index % 3 === 0 ? "Product" : "",
        index % 2 === 0 ? "Feature" : "",
        index % 5 === 0 ? "UX" : "",
        index % 7 === 0 ? "Technical" : "",
      ].filter(Boolean),
      priority: index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low",
      assignee: mockUsers[index % mockUsers.length].name,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      favorite: index % 5 === 0,
      emoji: emojiOptions[index % emojiOptions.length]
    };
  }) || [];

  // Document custom data (mock data)
  const documentsCustomData: Record<number, DocumentCustom> = {};
  documentsWithMetadata.forEach((doc, index) => {
    documentsCustomData[doc.id] = {
      createdBy: mockUsers[index % mockUsers.length].name,
      wordCount: Math.floor(Math.random() * 5000) + 500,
      estimatedReadTime: `${Math.floor(Math.random() * 30) + 5} min`,
      lastEdited: formatDate(new Date(doc.updatedAt)),
      lastEditedBy: mockUsers[(index + 1) % mockUsers.length].name,
      comments: Math.floor(Math.random() * 10)
    };
  });

  // Filtered documents based on search and filters
  const filteredDocuments = documentsWithMetadata?.filter((doc: DocumentWithMetadata) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = activeTags.length === 0 || activeTags.some(tag => doc.tags.includes(tag));
    const matchesStatus = !activeStatus || doc.status === activeStatus;
    const matchesPriority = !activePriority || doc.priority === activePriority;
    
    return matchesSearch && matchesTags && matchesStatus && matchesPriority;
  }) || [];

  // Sorted documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortField === "title") {
      return sortDirection === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === "updatedAt" || sortField === "createdAt") {
      return sortDirection === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    } else if (sortField === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aValue = a.priority ? priorityOrder[a.priority] : 0;
      const bValue = b.priority ? priorityOrder[b.priority] : 0;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
  });

  // Handle document selection
  const handleDocumentSelect = (documentId: number) => {
    const selectedDoc = documentsWithMetadata.find(doc => doc.id === documentId);
    if (selectedDoc) {
      setSelectedDocumentId(documentId);
      setTitle(selectedDoc.title);
      setContent(selectedDoc.content || "");
      setEmoji(selectedDoc.emoji || "📄");
      setIsDocumentOpen(true);
      setIsFullscreen(false);
    }
  };

  // Create new document
  const createNewDocument = () => {
    setSelectedDocumentId(null);
    setTitle("New Product Requirement Document");
    setContent("");
    setEmoji("📄");
    setIsDocumentOpen(true);
    setIsFullscreen(false);
  };

  // Toggle favorite status
  const toggleFavorite = (documentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would send an API request to update the document
    toast({
      title: "Favorite updated",
      description: "Document favorite status has been updated.",
    });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string, visible: boolean) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible } : col
    ));
  };

  // Reset columns to default
  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  // Toggle sort direction
  const toggleSort = (field: keyof DocumentWithMetadata) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
    
    const column = columns.find(col => col.id === resizingColumn);
    if (!column) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + deltaX); // Minimum width of 80px
    
    setColumns(columns.map(col => 
      col.id === resizingColumn ? { ...col, width: newWidth } : col
    ));
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

  // Update document mutation
  const updateDocument = useMutation({
    mutationFn: async () => {
      if (selectedDocumentId) {
        return apiRequest('PUT', `/api/documents/${selectedDocumentId}`, {
          title,
          content
        }).then(res => res.json());
      } else {
        return apiRequest('POST', '/api/documents', {
          title,
          content
        }).then(res => res.json());
      }
    },
    onSuccess: () => {
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      if (!isFullscreen) {
        setIsDocumentOpen(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateDocument.mutate();
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Toggle status filter
  const toggleStatusFilter = (status: StatusType) => {
    setActiveStatus(prev => prev === status ? null : status);
  };

  // Toggle priority filter
  const togglePriorityFilter = (priority: "low" | "medium" | "high") => {
    setActivePriority(prev => prev === priority ? null : priority);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveTags([]);
    setActiveStatus(null);
    setActivePriority(null);
  };

  // Get visible columns
  const visibleColumns = columns.filter(column => column.visible);

  // Render table header cell
  const renderTableHeaderCell = (column: ColumnType) => {
    const isSortable = ["title", "updatedAt", "createdAt", "priority", "dueDate"].includes(column.key as string);
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
          onClick={() => isSortable && toggleSort(column.key as keyof DocumentWithMetadata)}
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

  // Render a single cell content
  const renderCellContent = (document: DocumentWithMetadata, column: ColumnType) => {
    const key = column.key as string;
    
    switch (key) {
      case "title":
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center">
              <span className="text-lg">{document.emoji}</span>
            </div>
            <div className="truncate font-medium">
              {document.title}
            </div>
          </div>
        );
        
      case "status":
        return (
          <Badge variant="outline" className={`${getStatusBadge(document.status)}`}>
            {document.status === "in-review" ? "In Review" : document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
        );
        
      case "priority":
        return (
          <Badge variant="outline" className={`${getPriorityBadge(document.priority)}`}>
            {document.priority.charAt(0).toUpperCase() + document.priority.slice(1)}
          </Badge>
        );
        
      case "tags":
        return (
          <div className="flex items-center gap-1 overflow-hidden">
            {document.tags.length > 0 ? (
              <>
                {document.tags.slice(0, 2).map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 2 && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    +{document.tags.length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-xs">No tags</span>
            )}
          </div>
        );
        
      case "assignee":
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {document.assignee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{document.assignee}</span>
          </div>
        );
        
      case "dueDate":
        return document.dueDate ? (
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{formatDate(new Date(document.dueDate))}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No date</span>
        );
        
      case "updatedAt":
      case "createdAt":
        return (
          <span className="text-sm text-gray-500">
            {formatDate(new Date(document[key]))}
          </span>
        );
        
      case "createdBy":
        const customData = documentsCustomData[document.id];
        return customData ? (
          <span className="text-sm text-gray-700">{customData.createdBy}</span>
        ) : null;
        
      case "comments":
        const commentData = documentsCustomData[document.id];
        return commentData ? (
          <span className="text-sm text-gray-700">{commentData.comments}</span>
        ) : null;
        
      default:
        return null;
    }
  };

  // Render a single document row for the table
  const renderDocumentRow = (document: DocumentWithMetadata) => {
    return (
      <div 
        key={document.id} 
        className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleDocumentSelect(document.id)}
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
            onClick={(e) => toggleFavorite(document.id, e)}
          >
            <Star className="h-4 w-4" fill={document.favorite ? "currentColor" : "none"} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocumentSelect(document.id);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Render gallery view item
  const renderGalleryItem = (document: DocumentWithMetadata) => {
    return (
      <div 
        key={document.id}
        className="bg-white rounded-lg border hover:border-primary/30 hover:shadow-md transition-all overflow-hidden hover-lift cursor-pointer"
        onClick={() => handleDocumentSelect(document.id)}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{document.emoji}</span>
            <span className="text-sm font-medium truncate">{document.title}</span>
          </div>
          <button 
            className={cn(
              "p-1 rounded-full transition-colors",
              document.favorite ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:text-yellow-500 hover:bg-gray-100"
            )}
            onClick={(e) => toggleFavorite(document.id, e)}
          >
            <Star className="h-3.5 w-3.5" fill={document.favorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={`${getStatusBadge(document.status)}`}>
              {document.status === "in-review" ? "In Review" : document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </Badge>
            <span className="text-xs text-gray-500">{formatDate(new Date(document.updatedAt))}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {document.assignee.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{document.assignee}</span>
            </div>
            
            <Badge variant="outline" className={`${getPriorityBadge(document.priority)}`}>
              {document.priority.charAt(0).toUpperCase() + document.priority.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Document Table View */}
      <div className="h-full flex flex-col">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Documents</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your product requirement documents</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="w-64 pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              </div>
              
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      activeTags.length > 0 || activeStatus || activePriority ? "bg-primary/10 text-primary border-primary/20" : ""
                    )}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end">
                  <div className="p-3 border-b">
                    <h3 className="font-medium text-sm">Filter documents</h3>
                  </div>
                  
                  <div className="p-3 max-h-[70vh] overflow-auto">
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">STATUS</h4>
                      <div className="flex flex-wrap gap-2">
                        {["draft", "in-review", "approved", "archived"].map((status) => (
                          <Badge 
                            key={status} 
                            variant="outline"
                            className={cn(
                              getStatusBadge(status as StatusType),
                              activeStatus === status ? "ring-2 ring-offset-1 ring-primary/30" : ""
                            )}
                            onClick={() => toggleStatusFilter(status as StatusType)}
                          >
                            {status === "in-review" ? "In Review" : status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">PRIORITY</h4>
                      <div className="flex flex-wrap gap-2">
                        {["low", "medium", "high"].map((priority) => (
                          <Badge 
                            key={priority} 
                            variant="outline"
                            className={cn(
                              getPriorityBadge(priority as "low" | "medium" | "high"),
                              activePriority === priority ? "ring-2 ring-offset-1 ring-primary/30" : ""
                            )}
                            onClick={() => togglePriorityFilter(priority as "low" | "medium" | "high")}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">TAGS</h4>
                      <div className="flex flex-wrap gap-2">
                        {mockTags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline"
                            className={cn(
                              "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 cursor-pointer",
                              activeTags.includes(tag) ? "ring-2 ring-offset-1 ring-primary/30" : ""
                            )}
                            onClick={() => toggleTagFilter(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!activeTags.length && !activeStatus && !activePriority && !searchQuery}
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    {viewType === "table" ? (
                      <LayoutList className="h-4 w-4" />
                    ) : viewType === "gallery" ? (
                      <LayoutGrid className="h-4 w-4" />
                    ) : (
                      <Layout className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("cursor-pointer", viewType === "table" && "bg-primary/10 text-primary")}
                    onClick={() => setViewType("table")}
                  >
                    <LayoutList className="h-4 w-4 mr-2" />
                    Table
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("cursor-pointer", viewType === "gallery" && "bg-primary/10 text-primary")}
                    onClick={() => setViewType("gallery")}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Gallery
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("cursor-pointer", viewType === "list" && "bg-primary/10 text-primary")}
                    onClick={() => setViewType("list")}
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    List
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setIsColumnsDialogOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={createNewDocument}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
          
          {/* Active filters display */}
          {(activeTags.length > 0 || activeStatus || activePriority) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-500">Filters:</span>
              
              {activeStatus && (
                <Badge 
                  variant="outline"
                  className={getStatusBadge(activeStatus)}
                >
                  <X className="h-3 w-3 mr-1" onClick={() => setActiveStatus(null)} />
                  {activeStatus === "in-review" ? "In Review" : activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)}
                </Badge>
              )}
              
              {activePriority && (
                <Badge 
                  variant="outline"
                  className={getPriorityBadge(activePriority)}
                >
                  <X className="h-3 w-3 mr-1" onClick={() => setActivePriority(null)} />
                  {activePriority.charAt(0).toUpperCase() + activePriority.slice(1)}
                </Badge>
              )}
              
              {activeTags.map(tag => (
                <Badge 
                  key={tag}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <X className="h-3 w-3 mr-1" onClick={() => toggleTagFilter(tag)} />
                  {tag}
                </Badge>
              ))}
              
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Display based on view type */}
        {viewType === "table" ? (
          // Table View
          <div className="flex-1 flex flex-col overflow-hidden" ref={tableRef}>
            {/* Table Header Row */}
            <div className="flex items-center h-9 border-b border-gray-200 bg-gray-50">
              {visibleColumns.map(renderTableHeaderCell)}
              <div className="w-24"></div> {/* Space for action buttons */}
            </div>
            
            {/* Table Body */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading documents...</div>
              ) : sortedDocuments.length > 0 ? (
                sortedDocuments.map(renderDocumentRow)
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No documents found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first document</p>
                  <Button onClick={createNewDocument}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : viewType === "gallery" ? (
          // Gallery View
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading documents...</div>
            ) : sortedDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedDocuments.map(renderGalleryItem)}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-lg shadow-sm">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No documents found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first document</p>
                <Button onClick={createNewDocument}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            )}
          </div>
        ) : (
          // List View
          <div className="flex-1 overflow-y-auto bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading documents...</div>
            ) : sortedDocuments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {sortedDocuments.map(document => (
                  <div 
                    key={document.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleDocumentSelect(document.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{document.emoji}</span>
                        <h3 className="font-medium text-gray-800">{document.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getStatusBadge(document.status)}`}>
                          {document.status === "in-review" ? "In Review" : document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                        <button 
                          className={cn(
                            "p-1.5 rounded-full transition-colors",
                            document.favorite ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:text-yellow-500 hover:bg-gray-100"
                          )}
                          onClick={(e) => toggleFavorite(document.id, e)}
                        >
                          <Star className="h-4 w-4" fill={document.favorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {document.assignee.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{document.assignee}</span>
                        </div>
                        <div>
                          Last updated {formatDate(new Date(document.updatedAt))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {document.tags.slice(0, 2).map((tag, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 2 && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            +{document.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No documents found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first document</p>
                <Button onClick={createNewDocument}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customize Columns Dialog */}
      <Dialog open={isColumnsDialogOpen} onOpenChange={setIsColumnsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize columns</DialogTitle>
            <DialogDescription>
              Select which columns to display in the table view.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto py-4">
            <div className="space-y-4">
              {columns.map(column => (
                <div key={column.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Label htmlFor={`column-${column.id}`} className="text-sm font-medium cursor-pointer">
                      {column.name}
                    </Label>
                  </div>
                  <Switch
                    id={`column-${column.id}`}
                    checked={column.visible}
                    onCheckedChange={(checked) => toggleColumnVisibility(column.id, checked)}
                    disabled={column.key === "title"} // Title column is always visible
                  />
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={resetColumns}>
              Reset to default
            </Button>
            <Button onClick={() => setIsColumnsDialogOpen(false)}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Editor Dialog */}
      <Dialog 
        open={isDocumentOpen} 
        onOpenChange={(open) => {
          if (!open && isFullscreen) {
            setIsFullscreen(false);
          }
          setIsDocumentOpen(open);
        }}
      >
        <DialogContent 
          className={cn(
            "p-0 gap-0 overflow-hidden transition-all duration-200",
            isFullscreen ? "max-w-full w-full h-screen rounded-none" : "max-w-4xl h-[80vh]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Document Header */}
            <DialogHeader className="px-6 py-3 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!isFullscreen && (
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={() => setIsDocumentOpen(false)}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-2xl hover:bg-gray-100 rounded p-1">
                        {emoji}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="p-2">
                        <h3 className="text-sm font-medium mb-2">Select icon</h3>
                        <div className="grid grid-cols-7 gap-1">
                          {emojiOptions.map((e) => (
                            <button 
                              key={e} 
                              className={cn(
                                "w-8 h-8 text-lg flex items-center justify-center rounded hover:bg-gray-100",
                                emoji === e && "bg-primary/10 text-primary"
                              )}
                              onClick={() => setEmoji(e)}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <DialogTitle className="text-lg font-semibold">
                    {title || "Untitled Document"}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <PanelLeft className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={updateDocument.isPending}
                    className="gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {updateDocument.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Document Editor Tabs */}
            <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b">
                <div className="px-6">
                  <TabsList className="h-10">
                    <TabsTrigger value="content" className="data-[state=active]:bg-primary/5">
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="properties" className="data-[state=active]:bg-primary/5">
                      Properties
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="content" className="flex-1 overflow-auto p-0 m-0">
                <div className="p-6">
                  {/* Document Title */}
                  <div className="mb-8">
                    <Input
                      className="text-3xl font-semibold mb-3 p-3 border rounded-lg focus-visible:ring-primary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Document Title"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 items-center">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Last edited {formatDate(new Date())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Content Editor */}
                  <Card className="overflow-hidden border">
                    <div className="p-4">
                      <RichTextEditor
                        content={content}
                        onChange={(value) => setContent(value)}
                        placeholder="Start typing your document content here..."
                      />
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="properties" className="flex-1 overflow-auto p-0 m-0">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doc-status" className="text-sm text-gray-500">Status</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="mt-1 w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md">
                                <Badge variant="outline" className={getStatusBadge("draft")}>
                                  Draft
                                </Badge>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              {["draft", "in-review", "approved", "archived"].map((status) => (
                                <DropdownMenuItem key={status} className="cursor-pointer">
                                  <Badge variant="outline" className={getStatusBadge(status as StatusType)}>
                                    {status === "in-review" ? "In Review" : status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Badge>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div>
                          <Label htmlFor="doc-priority" className="text-sm text-gray-500">Priority</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="mt-1 w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md">
                                <Badge variant="outline" className={getPriorityBadge("medium")}>
                                  Medium
                                </Badge>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              {["low", "medium", "high"].map((priority) => (
                                <DropdownMenuItem key={priority} className="cursor-pointer">
                                  <Badge variant="outline" className={getPriorityBadge(priority as "low" | "medium" | "high")}>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                  </Badge>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="doc-tags" className="text-sm text-gray-500">Tags</Label>
                        <div className="mt-1 p-2 min-h-10 border rounded-md flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Product
                            <X className="h-3 w-3 ml-1 text-blue-500" />
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add Tag
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">People</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="doc-assignee" className="text-sm text-gray-500">Assignee</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="mt-1 w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    AJ
                                  </AvatarFallback>
                                </Avatar>
                                <span>Alex Johnson</span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            {mockUsers.map(user => (
                              <DropdownMenuItem key={user.id} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {user.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.name}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Created</Label>
                        <div className="mt-1 px-3 py-2 text-sm border rounded-md bg-gray-50 text-gray-700">
                          {formatDate(new Date())}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Last Updated</Label>
                        <div className="mt-1 px-3 py-2 text-sm border rounded-md bg-gray-50 text-gray-700">
                          {formatDate(new Date())}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="due-date" className="text-sm text-gray-500">Due Date</Label>
                        <Input id="due-date" type="date" className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentEditor;
