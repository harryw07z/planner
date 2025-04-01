import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Loader2,
  CheckCircle,
  HelpCircle,
  ChevronRightCircle,
  Sparkles
} from "lucide-react";
import { useColumnSuggestions, type ColumnSuggestion, type ColumnType } from '@/hooks/useColumnSuggestions';
import { cn } from '@/lib/utils';

interface ColumnSuggestionsPopoverProps {
  documents: any[];
  columns: ColumnType[];
  onApplySuggestion: (suggestionLayout: string[]) => void;
}

export function ColumnSuggestionsPopover({
  documents,
  columns,
  onApplySuggestion
}: ColumnSuggestionsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ColumnSuggestion[]>([]);
  const { generateSuggestions, isGenerating, error } = useColumnSuggestions();
  const [isNewSuggestion, setIsNewSuggestion] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && (suggestions.length === 0 || isNewSuggestion)) {
      fetchSuggestions();
      setIsNewSuggestion(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const results = await generateSuggestions({
        documentData: documents.slice(0, 5), // Limit to 5 documents to avoid overwhelming the AI
        currentColumns: columns,
        userRole: 'product manager' // Default role, could be customizable
      });
      setSuggestions(results.suggestions || []);
    } catch (err) {
      console.error("Failed to fetch column suggestions:", err);
    }
  };

  const handleApplySuggestion = (suggestion: ColumnSuggestion) => {
    onApplySuggestion(suggestion.layout);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <Sparkles className="h-4 w-4" />
          AI Suggestions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex flex-col max-h-[500px]">
          <div className="p-4 border-b bg-blue-50/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">AI Column Suggestions</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Intelligent layout suggestions to optimize your workflow based on your document content and usage patterns.
            </p>
          </div>
          
          <div className="py-2 px-1 overflow-y-auto">
            {isGenerating ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                <p className="text-sm">Generating smart suggestions...</p>
              </div>
            ) : error ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                <HelpCircle className="h-8 w-8 mb-2 text-red-500" />
                <p className="text-sm">Couldn't generate suggestions</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={fetchSuggestions}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-800">{suggestion.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs hover:bg-blue-100 text-blue-700"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        Apply <ChevronRightCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {suggestion.layout.slice(0, 4).map((columnKey, idx) => {
                        // Find the column object by key
                        const column = columns.find(col => col.key === columnKey);
                        if (!column) return null;
                        
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "text-[10px] py-0.5 px-1.5 rounded-sm",
                              idx === 0 ? "bg-blue-100 text-blue-800" :
                              idx === 1 ? "bg-green-100 text-green-800" :
                              idx === 2 ? "bg-purple-100 text-purple-800" :
                              "bg-orange-100 text-orange-800"
                            )}
                          >
                            {column.name}
                          </div>
                        );
                      })}
                      {suggestion.layout.length > 4 && (
                        <div className="text-[10px] py-0.5 px-1.5 rounded-sm bg-gray-100 text-gray-700">
                          +{suggestion.layout.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t p-3 bg-gray-50 text-xs text-gray-500 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            Suggestions are based on your document content and structure
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}