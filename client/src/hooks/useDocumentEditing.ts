import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Define these types directly as they might not be exported correctly from shared/schema
export type StatusType = "draft" | "in-progress" | "in-review" | "complete" | "archived";
export type PriorityType = "low" | "medium" | "high";

// Define cell editing state type
interface EditingCell {
  documentId: number;
  field: string;
}

export function useDocumentEditing() {
  // Editing state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const editCellRef = useRef<HTMLDivElement>(null);

  // Mutation for updating document fields
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ documentId, field, value }: { documentId: number, field: string, value: any }) => {
      const updateData: Record<string, any> = {};
      updateData[field] = value;
      
      const response = await apiRequest('PATCH', `/api/documents/${documentId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      // Update client state without toasts
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      console.error(`Failed to update document:`, error);
    }
  });

  // Start cell editing
  const startCellEdit = (documentId: number, field: string, initialValue: any) => {
    setEditingCell({ documentId, field });
    setEditValue(initialValue);
  };

  // Save cell edit
  const saveCellEdit = async (documentId: number, field: string, value: any) => {
    try {
      await updateDocumentMutation.mutateAsync({ documentId, field, value });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
    
    // Reset editing state
    setEditingCell(null);
    setEditValue(null);
  };

  // Cancel cell edit
  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue(null);
  };

  // Effect to handle click outside of editing cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editCellRef.current && !editCellRef.current.contains(event.target as Node)) {
        // If we're editing and clicked outside, save the edit
        if (editingCell && editValue !== null) {
          saveCellEdit(editingCell.documentId, editingCell.field, editValue);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCell, editValue]);

  return {
    editingCell,
    editValue,
    editCellRef,
    setEditValue,
    startCellEdit,
    saveCellEdit,
    cancelCellEdit,
    isPending: updateDocumentMutation.isPending
  };
}