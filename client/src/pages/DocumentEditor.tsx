import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  CalendarDays, 
  ArrowUpDown, 
  MoreHorizontal, 
  ChevronLeft,
  Share,
  Save,
  Filter,
  SortAsc,
  Tag
} from "lucide-react";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Define document status types
type StatusType = "draft" | "in-review" | "approved" | "archived";

// Extended Document type with status
interface DocumentWithStatus extends Document {
  status: StatusType;
}

// Mock tags data
const mockTags = ["Product", "Feature", "UX", "Technical", "Marketing"];

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

const DocumentEditor = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [title, setTitle] = useState("New Product Requirement Document");
  const [content, setContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"title" | "updatedAt">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  // Default project ID for demo
  const projectId = 1;

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', { projectId }],
    queryFn: () => apiRequest('GET', `/api/documents?projectId=${projectId}`).then(res => res.json()),
  });

  // Add status to documents (mock data for demo)
  const documentsWithStatus: DocumentWithStatus[] = documents?.map((doc: Document) => ({
    ...doc,
    status: doc.id % 4 === 0 ? "approved" : doc.id % 3 === 0 ? "in-review" : doc.id % 2 === 0 ? "archived" : "draft"
  })) || [];

  // Filtered & sorted documents
  const filteredDocuments = documentsWithStatus?.filter((doc: DocumentWithStatus) => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortField === "title") {
      return sortDirection === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortDirection === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Handle document selection
  const handleDocumentSelect = (documentId: number) => {
    const selectedDoc = documentsWithStatus.find(doc => doc.id === documentId);
    if (selectedDoc) {
      setSelectedDocumentId(documentId);
      setTitle(selectedDoc.title);
      setContent(selectedDoc.content || "");
      setIsDialogOpen(true);
    }
  };

  // Create new document
  const createNewDocument = () => {
    setSelectedDocumentId(null);
    setTitle("New Product Requirement Document");
    setContent("");
    setIsDialogOpen(true);
  };

  // Toggle sort direction
  const toggleSort = (field: "title" | "updatedAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Update document mutation
  const updateDocument = useMutation({
    mutationFn: async () => {
      if (selectedDocumentId) {
        return apiRequest('PUT', `/api/documents/${selectedDocumentId}`, {
          title,
          content,
          projectId
        }).then(res => res.json());
      } else {
        return apiRequest('POST', '/api/documents', {
          title,
          content,
          projectId
        }).then(res => res.json());
      }
    },
    onSuccess: () => {
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsDialogOpen(false);
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

  // Render a single document row for the table
  const renderDocumentRow = (document: DocumentWithStatus) => {
    return (
      <div 
        key={document.id} 
        className="grid grid-cols-12 gap-4 items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleDocumentSelect(document.id)}
      >
        <div className="col-span-5 flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="truncate font-medium">{document.title}</div>
        </div>
        <div className="col-span-2">
          <Badge variant="outline" className={`${getStatusBadge(document.status)}`}>
            {document.status === "in-review" ? "In Review" : document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
        </div>
        <div className="col-span-2 text-gray-500 text-sm">
          <span>{formatDate(new Date(document.updatedAt))}</span>
        </div>
        <div className="col-span-2 flex gap-1">
          {/* Mock tags - would be real data in production */}
          {document.id % 3 === 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
              Product
            </Badge>
          )}
          {document.id % 2 === 0 && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
              Feature
            </Badge>
          )}
        </div>
        <div className="col-span-1 flex justify-end">
          <button className="p-1 rounded hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter Documents</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={createNewDocument}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-4 items-center p-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          <div className="col-span-5 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("title")}>
            Document
            {sortField === "title" && (
              <SortAsc className={`h-3.5 w-3.5 ml-1 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
            )}
          </div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("updatedAt")}>
            Last Updated
            {sortField === "updatedAt" && (
              <SortAsc className={`h-3.5 w-3.5 ml-1 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
            )}
          </div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-1"></div>
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

        {/* Create/Edit Document Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Dialog Header */}
              <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <DialogTitle className="text-xl font-semibold">
                      {selectedDocumentId ? "Edit Document" : "New Document"}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2">
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

              {/* Document Editor Area */}
              <div className="flex-1 overflow-auto p-6">
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
                    <div className="flex gap-2 items-center">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex gap-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 cursor-pointer">
                          Product
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Content Editor */}
                <Card className="overflow-hidden border">
                  <div className="border-b p-2 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Content</div>
                  </div>
                  <div className="p-4">
                    <RichTextEditor
                      content={content}
                      onChange={(value) => setContent(value)}
                      placeholder="Start typing your PRD content here..."
                    />
                  </div>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DocumentEditor;
