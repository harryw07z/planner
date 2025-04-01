import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Plus, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export function EditableTags({
  tags,
  isEditing,
  editValue,
  commonTags,
  onStartEdit,
  onSave,
  onEditValueChange
}: EditableTagsProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editValue.includes(trimmedTag)) {
      onEditValueChange([...editValue, trimmedTag]);
      // We'll handle clearing the input separately using a key instead
    }
  };

  const handleRemoveTag = (tag: string) => {
    onEditValueChange(editValue.filter(t => t !== tag));
  };

  const handleCreateTag = () => {
    if (inputValue) {
      const trimmedTag = inputValue.trim();
      if (trimmedTag && !editValue.includes(trimmedTag)) {
        onEditValueChange([...editValue, trimmedTag]);
        setInputValue("");
      }
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
        <PopoverContent className="w-72 p-0" align="start">
          <div className="flex flex-col">
            <div className="flex items-center justify-between p-3 pb-0">
              <h4 className="font-medium text-sm">Tags</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSave(editValue)}
                className="h-7 text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Done
              </Button>
            </div>
            
            <div className="px-3 py-2">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editValue.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1 text-xs">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
                {editValue.length === 0 && (
                  <span className="text-gray-400 text-xs italic">No tags added yet</span>
                )}
              </div>
            </div>
            
            <Command className="rounded-t-none border-t">
              <CommandInput 
                placeholder="Search or create tag..." 
                value={inputValue}
                onValueChange={setInputValue}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  <CommandItem 
                    value={`create-${inputValue}`}
                    onSelect={handleCreateTag}
                    className="text-sm flex items-center justify-center gap-2 py-3 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 text-blue-500" />
                    Create "{inputValue}"
                  </CommandItem>
                </CommandEmpty>
                <CommandGroup heading="Suggested Tags">
                  {commonTags
                    .filter(tag => !editValue.includes(tag) && 
                      (inputValue === "" || tag.toLowerCase().includes(inputValue.toLowerCase())))
                    .map(tag => (
                      <CommandItem 
                        key={tag} 
                        value={tag}
                        onSelect={() => {
                          handleAddTag(tag);
                          setInputValue("");
                        }}
                        className="text-sm flex items-center gap-2"
                      >
                        <Tag className="h-3.5 w-3.5 text-gray-500" />
                        {tag}
                      </CommandItem>
                    ))
                  }
                </CommandGroup>

              </CommandList>
            </Command>
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