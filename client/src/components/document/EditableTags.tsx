import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

interface EditableTagsProps {
  tags: string[] | null | undefined;
  isEditing: boolean;
  editValue: string[];
  commonTags: string[];
  onStartEdit: () => void;
  onSave: (tags: string[]) => void;
  onEditValueChange: (newTags: string[]) => void;
}

export function EditableTags({
  tags,
  isEditing,
  editValue,
  commonTags,
  onStartEdit,
  onSave,
  onEditValueChange
}: EditableTagsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    if (inputRef.current && inputRef.current.value) {
      const newTag = inputRef.current.value.trim();
      if (newTag && !editValue.includes(newTag)) {
        onEditValueChange([...editValue, newTag]);
        inputRef.current.value = '';
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    onEditValueChange(editValue.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleToggleTag = (tag: string, checked: boolean) => {
    if (checked) {
      onEditValueChange([...editValue, tag]);
    } else {
      onEditValueChange(editValue.filter(t => t !== tag));
    }
  };

  if (isEditing) {
    return (
      <Popover open={true} onOpenChange={(open) => {
        if (!open) {
          onSave(editValue);
        }
      }}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-1 overflow-hidden cursor-pointer p-1 border border-dashed border-primary/40 rounded">
            {tags && tags.length > 0 ? (
              <>
                {tags.slice(0, 2).map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    +{tags.length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-xs">Add tags</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Tags</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onSave(editValue)}
                  className="h-8 text-xs"
                >
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {editValue.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1.5 text-sm">
                    {tag}
                    <X
                      className="h-3.5 w-3.5 ml-1.5 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
                {editValue.length === 0 && (
                  <span className="text-gray-400 text-sm italic">No tags added yet</span>
                )}
              </div>
              
              <div className="flex mb-4">
                <Input
                  ref={inputRef}
                  placeholder="Type a tag and press Enter to add..."
                  className="text-sm"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Common tags</h4>
              <div className="grid grid-cols-2 gap-1">
                {commonTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`tag-${tag}`}
                      checked={editValue.includes(tag)}
                      onCheckedChange={(checked) => {
                        handleToggleTag(tag, checked as boolean);
                      }}
                    />
                    <Label 
                      htmlFor={`tag-${tag}`}
                      className="text-sm cursor-pointer"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div 
            className="flex items-center gap-1 overflow-hidden cursor-pointer"
            onDoubleClick={onStartEdit}
          >
            {tags && tags.length > 0 ? (
              <>
                {tags.slice(0, 2).map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    +{tags.length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-xs">No tags</span>
            )}
          </div>
        </TooltipTrigger>
        {tags && tags.length > 2 && (
          <TooltipContent>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium mb-1">All tags:</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}