import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { DocumentTable } from "@/components/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { StatusType, PriorityType } from "@/hooks/useDocumentEditing";

// Define our own DocumentWithMetadata interface (simplified from schema)
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
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Search, 
  Filter,
  Star,
  X,
} from "lucide-react";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";

// Common constants
const DEFAULT_COLUMNS = [
  { id: "col-1", name: "Title", key: "title", visible: true, width: 300 },
  { id: "col-2", name: "Status", key: "status", visible: true, width: 120 },
  { id: "col-3", name: "Last Updated", key: "updatedAt", visible: true, width: 150 },
  { id: "col-4", name: "Tags", key: "tags", visible: true, width: 180 },
  { id: "col-5", name: "Priority", key: "priority", visible: true, width: 120 },
  { id: "col-6", name: "Assignee", key: "assignedTo", visible: true, width: 150 },
  { id: "col-7", name: "Due Date", key: "dueDate", visible: false, width: 120 },
  { id: "col-8", name: "Created At", key: "createdAt", visible: false, width: 150 },
  { id: "col-9", name: "Created By", key: "createdBy", visible: false, width: 150 },
  { id: "col-10", name: "Comments", key: "comments", visible: false, width: 100 },
];

const EMOJI_OPTIONS = [
  "📄", "📝", "📊", "📈", "📱", "💻", "🔍", "⚙️", "🚀", "💡", "🎯", "🏆", "🗂️", "📚", "📋"
];

const MOCK_TAGS = ["Product", "Feature", "UX", "Technical", "Marketing"];

const MOCK_USERS = [
  { id: 1, name: "Alex Johnson", avatar: "", initials: "AJ", email: "aj@example.com" },
  { id: 2, name: "Sarah Lee", avatar: "", initials: "SL", email: "sarah@example.com" },
  { id: 3, name: "David Kim", avatar: "", initials: "DK", email: "david@example.com" },
  { id: 4, name: "Emily Chen", avatar: "", initials: "EC", email: "emily@example.com" }
];

// Random date helper function
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Get status badge styling
const getStatusBadge = (status: StatusType) => {
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

// Get priority badge styling
const getPriorityBadge = (priority: PriorityType | null) => {
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

const DocumentEditor = () => {
  // Document state
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState<string>("📄");
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Table filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusType | null>(null);
  const [activePriority, setActivePriority] = useState<PriorityType | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Table configuration
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [viewType, setViewType] = useState<"table" | "gallery" | "list">("table");
  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isColumnsDialogOpen, setIsColumnsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: () => apiRequest('GET', '/api/documents').then(res => res.json()),
  });

  // Add metadata to documents (mock data for demo)
  const documentsWithMetadata = useMemo(() => {
    if (!documents) return [];
    
    return documents.map((doc: any, index: number) => {
      // Random date from last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const dueDate = index % 3 === 0 ? getRandomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 2))) : undefined;
      
      return {
        ...doc,
        status: doc.id % 5 === 0 ? "complete" : doc.id % 4 === 0 ? "in-progress" : doc.id % 3 === 0 ? "in-review" : doc.id % 2 === 0 ? "archived" : "draft",
        tags: [
          index % 3 === 0 ? "Product" : "",
          index % 2 === 0 ? "Feature" : "",
          index % 5 === 0 ? "UX" : "",
          index % 7 === 0 ? "Technical" : "",
        ].filter(Boolean),
        priority: index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low",
        assignedTo: MOCK_USERS[index % MOCK_USERS.length].name,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        favorite: index % 5 === 0,
        emoji: EMOJI_OPTIONS[index % EMOJI_OPTIONS.length],
        custom: {
          createdBy: MOCK_USERS[index % MOCK_USERS.length].name,
          wordCount: Math.floor(Math.random() * 5000) + 500,
          estimatedReadTime: `${Math.floor(Math.random() * 30) + 5} min`,
          lastEdited: formatDate(new Date(doc.updatedAt)),
          lastEditedBy: MOCK_USERS[(index + 1) % MOCK_USERS.length].name,
          comments: Math.floor(Math.random() * 10)
        }
      };
    });
  }, [documents]);
  
  // Filtered documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documentsWithMetadata?.filter((doc: DocumentWithMetadata) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = activeTags.length === 0 || activeTags.some(tag => doc.tags.includes(tag));
      const matchesStatus = !activeStatus || doc.status === activeStatus;
      const matchesPriority = !activePriority || doc.priority === activePriority;
      
      return matchesSearch && matchesTags && matchesStatus && matchesPriority;
    }) || [];
  }, [documentsWithMetadata, searchQuery, activeTags, activeStatus, activePriority]);

  // Sorted documents
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
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
  }, [filteredDocuments, sortField, sortDirection]);

  // Document selection handler
  const handleDocumentSelect = useCallback((documentId: number) => {
    // Here we would navigate to a document detail page
    console.log(`Navigating to document: ${documentId}`);
    
    // Open the editor directly (a real app would use routing)
    const selectedDoc = documentsWithMetadata.find(doc => doc.id === documentId);
    if (selectedDoc) {
      setSelectedDocumentId(documentId);
      setTitle(selectedDoc.title);
      setContent(selectedDoc.content || "");
      setEmoji(selectedDoc.emoji || "📄");
      setIsDocumentOpen(true);
      setIsFullscreen(false);
    }
  }, [documentsWithMetadata]);

  // Create new document
  const createNewDocument = useCallback(() => {
    setSelectedDocumentId(null);
    setTitle("New Product Requirement Document");
    setContent("");
    setEmoji("📄");
    setIsDocumentOpen(true);
    setIsFullscreen(false);
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((documentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would send an API request to update the document
    // No toast notification as requested
    
    // Update client state silently
    queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
  }, []);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible } : col
    ));
  }, [columns]);

  // Reset columns to default
  const resetColumns = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
  }, []);

  // Toggle sort direction
  const toggleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  // Resize column
  const handleResizeColumn = useCallback((columnId: string, width: number) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, width } : col
    ));
  }, [columns]);

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

  const handleSave = useCallback(() => {
    updateDocument.mutate();
  }, [updateDocument]);

  // Toggle tag filter
  const toggleTagFilter = useCallback((tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  }, []);

  // Toggle status filter
  const toggleStatusFilter = useCallback((status: StatusType) => {
    setActiveStatus(prev => prev === status ? null : status);
  }, []);

  // Toggle priority filter
  const togglePriorityFilter = useCallback((priority: PriorityType) => {
    setActivePriority(prev => prev === priority ? null : priority);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveTags([]);
    setActiveStatus(null);
    setActivePriority(null);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Document Editor Page */}
      <Dialog 
        open={isDocumentOpen} 
        onOpenChange={setIsDocumentOpen}
        modal={!isFullscreen}
      >
        <DialogContent 
          className={isFullscreen ? "max-w-full h-full rounded-none p-0 border-none" : "max-w-4xl"}
          onInteractOutside={(e) => {
            if (isFullscreen) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div className="w-full">
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="text-xl font-semibold border-none px-0 focus-visible:ring-0"
                />
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 flex-grow overflow-auto">
            <RichTextEditor
              value={content}
              onChange={setContent}
            />
          </div>
          
          <DialogFooter className="px-6 pb-6">
            <Button 
              variant="outline" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateDocument.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document List Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Product Documents</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              className="pl-9 h-9 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="h-9 gap-1"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filter
            {(activeTags.length > 0 || activeStatus || activePriority) && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none ml-1">
                {activeTags.length + (activeStatus ? 1 : 0) + (activePriority ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          <Button className="h-9 gap-1" onClick={createNewDocument}>
            <PlusCircle className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>
      
      {/* View Tabs */}
      <div className="border-b px-4">
        <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Main Content - Document Table */}
      <div className="flex-grow overflow-auto">
        {viewType === "table" && (
          <DocumentTable
            documents={sortedDocuments}
            columns={columns}
            onDocumentSelect={handleDocumentSelect}
            onFavoriteToggle={toggleFavorite}
            onResizeColumn={handleResizeColumn}
            onToggleSort={toggleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            commonTags={MOCK_TAGS}
            mockUsers={MOCK_USERS}
          />
        )}
      </div>
      
      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Documents</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {["draft", "in-progress", "in-review", "complete", "archived"].map((status) => (
                  <Badge 
                    key={status} 
                    variant="outline" 
                    className={`${getStatusBadge(status as StatusType)} cursor-pointer ${activeStatus === status ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => toggleStatusFilter(status as StatusType)}
                  >
                    {status === "in-review" ? "In Review" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Priority</h3>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority) => (
                  <Badge 
                    key={priority} 
                    variant="outline" 
                    className={`${getPriorityBadge(priority as PriorityType)} cursor-pointer ${activePriority === priority ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => togglePriorityFilter(priority as PriorityType)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_TAGS.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={`bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 cursor-pointer ${activeTags.includes(tag) ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => toggleTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentEditor;