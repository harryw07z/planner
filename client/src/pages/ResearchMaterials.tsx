import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import FileUpload from "@/components/research/FileUpload";
import MaterialCard from "@/components/research/MaterialCard";
import AnalysisResults from "@/components/research/AnalysisResults";
import { Material, MaterialAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ResearchMaterials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const { toast } = useToast();

  // Default project ID for demo
  const projectId = 1;

  // Fetch materials
  const {
    data: materials = [],
    isLoading: materialsLoading,
    refetch: refetchMaterials
  } = useQuery({
    queryKey: ['/api/materials', { projectId }],
    queryFn: () => apiRequest('GET', `/api/materials?projectId=${projectId}`).then(res => res.json()),
  });

  // Fetch analysis for selected material
  const {
    data: analysis,
    isLoading: analysisLoading,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['/api/materials/analysis', { materialId: selectedMaterialId }],
    queryFn: () => {
      if (!selectedMaterialId) return null;
      return apiRequest('GET', `/api/materials/${selectedMaterialId}/analysis`).then(res => res.json());
    },
    enabled: !!selectedMaterialId,
  });

  // Generate PRD mutation
  const generatePRD = useMutation({
    mutationFn: async (data: { projectId: number; title: string; insights: string[] }) => {
      return apiRequest('POST', '/api/documents/generate', data).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "PRD Generated",
        description: "Your PRD has been generated successfully.",
      });
      // Navigate to document editor with new document
      window.location.href = `/document?id=${data.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle material deletion
  const handleDeleteMaterial = (id: number) => {
    if (id === selectedMaterialId) {
      setSelectedMaterialId(null);
    }
    refetchMaterials();
  };

  // Handle material analysis
  const handleAnalyzeMaterial = (id: number) => {
    setSelectedMaterialId(id);
    refetchAnalysis();
  };

  // Handle PRD generation
  const handleGeneratePRD = (insights: string[]) => {
    generatePRD.mutate({
      projectId,
      title: "Generated PRD from Research Analysis",
      insights
    });
  };

  // Filter materials based on search and file type
  const filteredMaterials = materials.filter((material: Material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === "all" || material.type.includes(fileTypeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="py-6 px-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text mb-1">Research Materials</h2>
          <p className="text-sm text-neutral-500">Upload and analyze research data to generate PRD insights</p>
        </div>
        
        <div className="mb-6">
          <FileUpload 
            projectId={projectId}
            onUploadComplete={() => refetchMaterials()}
          />
          <p className="text-xs text-neutral-500 mb-2">Supported formats: PDF, DOCX, XLSX, CSV, JPG, PNG</p>
          <p className="text-xs text-neutral-500">Max file size: 20MB</p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Uploaded Materials</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm py-1 pl-8 pr-3 w-[200px]"
                />
              </div>
              <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                <SelectTrigger className="text-sm py-1 h-9 w-[120px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {materialsLoading ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg">
              <p className="text-neutral-500">No materials found</p>
              <p className="text-sm text-neutral-400 mt-1">Upload research materials to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material: Material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onDelete={handleDeleteMaterial}
                  onAnalyze={handleAnalyzeMaterial}
                />
              ))}
            </div>
          )}
        </div>
        
        <AnalysisResults
          analysis={analysis}
          projectId={projectId}
          onGeneratePRD={handleGeneratePRD}
          onRefreshAnalysis={refetchAnalysis}
        />
      </div>
    </div>
  );
};

export default ResearchMaterials;
