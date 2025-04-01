import { useState } from "react";
import { FileUp, FileText, FileSpreadsheet, File, Eye, BarChart, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Material } from "@/lib/types";
import { useToast } from "@/hooks/useToast";
import { formatFileSize, formatDate, getFileIconColor } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface MaterialCardProps {
  material: Material;
  onDelete: (id: number) => void;
  onAnalyze: (id: number) => void;
}

const MaterialCard = ({ material, onDelete, onAnalyze }: MaterialCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const getFileIcon = () => {
    if (material.type.includes('pdf')) {
      return <FileText className={`h-8 w-8 text-red-500`} />;
    } else if (material.type.includes('spreadsheet') || material.type.includes('excel') || material.type.includes('csv')) {
      return <FileSpreadsheet className={`h-8 w-8 text-green-500`} />;
    } else if (material.type.includes('word') || material.type.includes('document')) {
      return <FileText className={`h-8 w-8 text-blue-500`} />;
    } else {
      return <File className={`h-8 w-8 ${getFileIconColor(material.type)}`} />;
    }
  };

  const handleView = () => {
    window.open(`/api/materials/${material.id}/content`, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/materials/${material.id}/content`;
    link.download = material.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest('DELETE', `/api/materials/${material.id}`);
      onDelete(material.id);
      toast({
        title: "Material deleted",
        description: `${material.name} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      await apiRequest('POST', `/api/materials/${material.id}/analyze`);
      onAnalyze(material.id);
      toast({
        title: "Analysis complete",
        description: `${material.name} has been analyzed.`,
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          {getFileIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">{material.name}</h4>
          <p className="text-xs text-neutral-500 mb-2">
            {formatFileSize(material.size)} • Uploaded {formatDate(material.uploadedAt)}
          </p>
          <div className="flex items-center text-xs">
            <span className="inline-block px-2 py-0.5 bg-neutral-100 text-text rounded mr-2">
              {material.type.split('/')[1]?.toUpperCase() || material.type}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleView}>
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-primary" 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <BarChart className="h-3 w-3 mr-1" />
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs text-text" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-red-500" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash className="h-3 w-3 mr-1" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default MaterialCard;
