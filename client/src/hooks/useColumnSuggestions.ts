import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type ColumnSuggestion = {
  name: string;
  layout: string[];
  description: string;
};

export type ColumnSuggestionResponse = {
  suggestions: ColumnSuggestion[];
};

export type ColumnType = {
  id: string;
  name: string;
  key: string;
  visible: boolean;
  width: number;
};

export function useColumnSuggestions() {
  const generateSuggestionsMutation = useMutation({
    mutationFn: async ({
      documentData,
      currentColumns,
      userRole = 'product manager'
    }: {
      documentData: any[];
      currentColumns: ColumnType[];
      userRole?: string;
    }): Promise<ColumnSuggestionResponse> => {
      const response = await apiRequest(
        'POST',
        '/api/columns/suggestions',
        { documentData, currentColumns, userRole }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate column suggestions');
      }
      
      return response.json();
    }
  });

  return {
    generateSuggestions: generateSuggestionsMutation.mutateAsync,
    isGenerating: generateSuggestionsMutation.isPending,
    error: generateSuggestionsMutation.error
  };
}