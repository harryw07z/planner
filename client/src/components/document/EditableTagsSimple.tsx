import { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Plus, Tag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface EditableTagsProps {
  tags: string[] | null | undefined;
  isEditing: boolean;
  editValue: string[];
  commonTags: string[];
  onStartEdit: () => void;
  onSave: (tags: string[]) => void;
  onEditValueChange: (newTags: string[]) => void;
}

export function EditableTagsSimple({
  tags,
  isEditing,
  editValue,
  commonTags,
  onStartEdit,
  onSave,
  onEditValueChange
}: EditableTagsProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isEditing]);

  // Non-editable display mode
  if (!isEditing) {
    return (
      <div
        className="flex items-center gap-1 overflow-hidden cursor-pointer rounded hover:bg-gray-50 py-1 px-0.5 transition-colors group w-full"
        onClick={onStartEdit} // Changed to single-click for easier access
      >
        {tags && tags.length > 0 ? (
          <div className="flex items-center gap-1 w-full max-w-full flex-nowrap">
            {tags.length <= 2 ? (
              // Show all tags when there are only 1-2 tags
              tags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 text-xs whitespace-nowrap"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              // Show only first tag and a count when there are more than 2
              <>
                <Badge 
                  key={0} 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 text-xs whitespace-nowrap flex-shrink-0"
                >
                  {tags[0]}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 cursor-help flex-shrink-0 text-xs">
                        +{tags.length - 1}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent align="start" className="p-2">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {tags.slice(1).map((tag, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-400 text-xs">
            <Tag className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span>Add tags</span>
          </div>
        )}
      </div>
    );
  }

  // Editing mode
  const addTagFn = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editValue.includes(trimmedTag)) {
      onEditValueChange([...editValue, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTagFn = (tag: string) => {
    onEditValueChange(editValue.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Add tag on Enter
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTagFn(inputValue);
    }
    // Close and save on Escape
    else if (e.key === 'Escape') {
      onSave(editValue);
    }
  };

  return (
    <Popover open={true} onOpenChange={(open) => {
      if (!open) {
        onSave(editValue);
      }
    }}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1 overflow-hidden cursor-pointer p-1 border border-dashed border-primary/40 rounded bg-white">
          {/* This is just a placeholder during edit mode */}
          <span className="text-xs text-primary">Editing tags...</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 shadow-lg" align="start" sideOffset={5}>
        <div className="flex flex-col bg-white rounded-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium text-sm text-gray-700">Edit Tags</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSave(editValue)}
              className="h-7 text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Done
            </Button>
          </div>
          
          {/* Current tags */}
          <div className="px-3 py-2 bg-gray-50">
            <div className="flex flex-wrap gap-1.5">
              {editValue.map((tag, i) => (
                <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs flex items-center">
                  {tag}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => removeTagFn(tag)}
                  />
                </Badge>
              ))}
              {editValue.length === 0 && (
                <span className="text-gray-400 text-xs italic">No tags added yet</span>
              )}
            </div>
          </div>
          
          {/* Search/create input */}
          <div className="p-2 border-t border-b">
            <div className="flex items-center px-2 py-1 border rounded-md bg-gray-50">
              <Tag className="h-4 w-4 text-gray-400 mr-2" />
              <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to add or search..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-sm focus:outline-none"
              />
              {inputValue.trim() && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => addTagFn(inputValue)}
                  className="h-6 w-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Suggested tags */}
          {commonTags.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              <div className="px-3 py-2">
                <h5 className="text-xs font-medium text-gray-500 mb-1">SUGGESTED TAGS</h5>
                <div className="flex flex-wrap gap-1">
                  {commonTags
                    .filter(tag => !editValue.includes(tag) && 
                      (inputValue === "" || tag.toLowerCase().includes(inputValue.toLowerCase())))
                    .map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="bg-gray-50 text-gray-700 border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => addTagFn(tag)}
                      >
                        {tag}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}