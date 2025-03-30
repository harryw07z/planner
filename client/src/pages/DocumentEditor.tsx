import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Save, FileText, Calendar, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

const DocumentEditor = () => {
  const [title, setTitle] = useState("New Product Requirement Document");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("document");
  const { toast } = useToast();

  // Default project ID for demo
  const projectId = 1;

  // Fetch document
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', { projectId }],
    queryFn: () => apiRequest('GET', `/api/documents?projectId=${projectId}`).then(res => res.json()),
  });

  // Use the first document if available
  useEffect(() => {
    if (documents && documents.length > 0) {
      setTitle(documents[0].title);
      setContent(documents[0].content || "");
    }
  }, [documents]);

  // Update document mutation
  const updateDocument = useMutation({
    mutationFn: async () => {
      if (documents && documents.length > 0) {
        return apiRequest('PUT', `/api/documents/${documents[0].id}`, {
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

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-text">{title}</h2>
              <span className="ml-4 px-2 py-1 text-xs bg-neutral-100 text-text rounded">Draft</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="mr-4" onClick={() => {}}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={updateDocument.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateDocument.isPending ? "Saving..." : "Save"}
            </Button>
            <div className="ml-4 relative">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-neutral-200">
        <Tabs defaultValue="document" onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="h-auto p-0 bg-transparent border-b-0">
              <TabsTrigger 
                value="document" 
                className="px-4 py-3 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=inactive]:bg-transparent"
              >
                Document
              </TabsTrigger>
              <TabsTrigger 
                value="research" 
                className="px-4 py-3 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=inactive]:bg-transparent"
              >
                Research Materials
              </TabsTrigger>
              <TabsTrigger 
                value="roadmap" 
                className="px-4 py-3 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=inactive]:bg-transparent"
              >
                Roadmap
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="px-4 py-3 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=inactive]:bg-transparent"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Document Title */}
          <div className="mb-8">
            <Input
              className="text-3xl font-semibold text-text mb-2 p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center text-sm text-neutral-400">
              <span>Last edited {formatDate(new Date())} • Product Manager: Alex Johnson</span>
            </div>
          </div>

          {/* Document Content Editor */}
          <div className="editor-content">
            <RichTextEditor
              content={content}
              onChange={(value) => setContent(value)}
              placeholder="Start typing your PRD content here..."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentEditor;
