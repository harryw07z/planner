import { useState } from 'react';
import { Input } from "@/components/ui/input";

interface EditableTitleProps {
  title: string;
  emoji: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (title: string) => void;
  onNavigate?: () => void;
}

export function EditableTitle({
  title,
  emoji,
  isEditing,
  onStartEdit,
  onSave,
  onNavigate
}: EditableTitleProps) {
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSave = () => {
    onSave(editedTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(title); // Reset to original
      onSave(title);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center cursor-pointer">
          <span className="text-lg">{emoji}</span>
        </div>
        <Input
          className="h-8 min-w-0 border-primary/30"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  // Default non-editing view
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 cursor-pointer">
        <span className="text-lg">{emoji}</span>
      </div>
      <div className="flex items-center w-full">
        <div 
          className="truncate font-medium cursor-pointer hover:text-primary hover:underline"
          onClick={onNavigate}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}