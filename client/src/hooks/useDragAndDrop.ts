import { useState, useCallback } from 'react';

interface UseDragAndDropOptions {
  onDrop?: (data: any, target: any) => void;
}

export const useDragAndDrop = ({ onDrop }: UseDragAndDropOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: any) => {
    setIsDragging(true);
    setDraggedItem(item);
    
    // Set data transfer
    e.dataTransfer.effectAllowed = 'move';
    try {
      if (typeof item === 'object') {
        e.dataTransfer.setData('application/json', JSON.stringify(item));
      } else {
        e.dataTransfer.setData('text/plain', String(item));
      }
    } catch (error) {
      console.error('Error setting data transfer:', error);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: any) => {
      e.preventDefault();
      
      let data;
      try {
        // Try to get the data
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
          data = JSON.parse(jsonData);
        } else {
          data = e.dataTransfer.getData('text/plain');
        }
        
        // If we have a callback, call it
        if (onDrop && data) {
          onDrop(data, target);
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
      
      setIsDragging(false);
      setDraggedItem(null);
    },
    [onDrop]
  );

  return {
    isDragging,
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
