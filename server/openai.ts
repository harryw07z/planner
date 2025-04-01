import aiService from "./services/ai";

// Re-export functions from the AI service for backward compatibility
export const analyzeResearchMaterial = aiService.analyzeResearchMaterial.bind(aiService);
export const generatePrdDraft = aiService.generatePrdDraft.bind(aiService);
export const generateFeatureIdeas = aiService.generateFeatureIdeas.bind(aiService);

// Export the service as default
export default {
  analyzeResearchMaterial,
  generatePrdDraft,
  generateFeatureIdeas,
};
