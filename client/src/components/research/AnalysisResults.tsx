import { useState } from "react";
import { MaterialAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AnalysisResultsProps {
  analysis: MaterialAnalysis | null;
  projectId: number;
  onGeneratePRD: (insights: string[]) => void;
  onRefreshAnalysis: () => void;
}

const AnalysisResults = ({ analysis, projectId, onGeneratePRD, onRefreshAnalysis }: AnalysisResultsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleGeneratePRD = async () => {
    if (!analysis) return;
    
    try {
      setIsGenerating(true);
      // Extract insights from analysis
      const insights = analysis.insights.insights;
      onGeneratePRD(insights);
    } catch (error: any) {
      toast({
        title: "PRD generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    try {
      setIsRefreshing(true);
      await onRefreshAnalysis();
    } catch (error: any) {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!analysis) {
    return (
      <div className="bg-neutral-100 p-4 rounded-lg text-center">
        <p className="text-sm text-text">No analysis results yet. Analyze materials to see insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Analysis Results</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary text-sm"
          onClick={handleRefreshAnalysis}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
        </Button>
      </div>
      
      <div className="bg-secondary bg-opacity-10 p-4 rounded-lg mb-4 border border-secondary border-opacity-30">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <Info className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Analysis completed</h4>
            <p className="text-xs text-text">Analysis completed on {formatDate(analysis.analyzedAt)}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2">Key Insights</h4>
        <ul className="text-sm">
          {analysis.insights.insights.map((insight, index) => (
            <li key={index} className="flex items-start mb-2">
              <CheckCircle className="h-5 w-5 text-accent mr-2 flex-shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium text-sm mb-2">Recommended PRD Sections</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.insights.recommendations.map((recommendation, index) => (
            <button 
              key={index} 
              className="text-left border border-neutral-200 rounded p-3 hover:border-primary hover:bg-primary hover:bg-opacity-5"
            >
              <h5 className="font-medium text-sm mb-1">{recommendation.title}</h5>
              <p className="text-xs text-neutral-500">{recommendation.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Button 
        className="w-full py-3 mt-4 bg-primary text-white rounded-lg font-medium"
        onClick={handleGeneratePRD}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate PRD Draft from Analysis"}
      </Button>
    </div>
  );
};

export default AnalysisResults;
