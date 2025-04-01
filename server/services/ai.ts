import OpenAI from "openai";

// Define interfaces for our AI responses
export interface AIInsight {
  insights: string[];
  recommendations: { 
    title: string; 
    description: string 
  }[];
}

export interface AIServiceConfig {
  provider: 'xai' | 'openai';
  apiKey?: string;
}

/**
 * AI Service Class that abstracts the underlying provider (XAI/GrokAI or OpenAI)
 */
export class AIService {
  private client: OpenAI;
  private provider: 'xai' | 'openai';
  private defaultModel: string;

  constructor(config: AIServiceConfig) {
    this.provider = config.provider;
    
    // Configure client based on provider
    if (this.provider === 'xai') {
      if (!process.env.XAI_API_KEY && !config.apiKey) {
        throw new Error("XAI_API_KEY is required for XAI provider");
      }
      
      this.client = new OpenAI({ 
        baseURL: "https://api.x.ai/v1",
        apiKey: config.apiKey || process.env.XAI_API_KEY 
      });
      this.defaultModel = "grok-2-1212";
    } else {
      if (!process.env.OPENAI_API_KEY && !config.apiKey) {
        throw new Error("OPENAI_API_KEY is required for OpenAI provider");
      }
      
      this.client = new OpenAI({ 
        apiKey: config.apiKey || process.env.OPENAI_API_KEY 
      });
      this.defaultModel = "gpt-4o";
    }
  }

  /**
   * Analyze research material and extract key insights
   */
  async analyzeResearchMaterial(text: string): Promise<AIInsight> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content:
              "You are a product management assistant analyzing research materials. Extract key insights and recommend PRD sections based on the research. Respond with JSON in this format: { 'insights': string[], 'recommendations': { title: string, description: string }[] }",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      // Handle potential null content
      const content = response.choices[0].message.content || '{"insights":[],"recommendations":[]}';
      return JSON.parse(content);
    } catch (error: any) {
      console.error("Failed to analyze research material:", error);
      throw new Error("Failed to analyze research material: " + error.message);
    }
  }

  /**
   * Generate PRD draft based on insights
   */
  async generatePrdDraft(insights: string[], title: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content:
              "You are a product management assistant generating a Product Requirements Document (PRD) draft based on the provided insights. Create a well-structured PRD with sections for Executive Summary, Problem Statement, Goals, User Personas, Features and Requirements, Timeline, and Success Metrics.",
          },
          {
            role: "user",
            content: `Generate a PRD draft for a product titled "${title}" based on these insights: ${insights.join(", ")}`,
          },
        ],
      });

      // Handle potential null content
      return response.choices[0].message.content || `# ${title}\n\nUnable to generate PRD content. Please try again with more detailed insights.`;
    } catch (error: any) {
      console.error("Failed to generate PRD draft:", error);
      throw new Error("Failed to generate PRD draft: " + error.message);
    }
  }
  
  /**
   * Generate feature ideas based on a product description
   */
  async generateFeatureIdeas(
    productDescription: string, 
    count: number = 5
  ): Promise<{ name: string; description: string; priority: 'high' | 'medium' | 'low'; duration: number }[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content:
              "You are a product management assistant generating feature ideas. Generate realistic, valuable features with appropriate priorities and durations. Return a JSON array of feature objects with name, description, priority (high, medium, low), and duration (in days).",
          },
          {
            role: "user",
            content: `Generate ${count} feature ideas for a product described as: "${productDescription}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      // Handle potential null content
      const content = response.choices[0].message.content || '{"features":[]}';
      const parsed = JSON.parse(content);
      return parsed.features || [];
    } catch (error: any) {
      console.error("Failed to generate feature ideas:", error);
      throw new Error("Failed to generate feature ideas: " + error.message);
    }
  }
  
  /**
   * Generate column customization suggestions based on documents and user behavior
   */
  async generateColumnSuggestions(
    documentData: Array<any>, 
    currentColumns: Array<{id: string, name: string, key: string}>,
    userRole: string = 'product manager'
  ): Promise<{ 
    suggestions: Array<{
      name: string;
      layout: Array<string>;
      description: string;
    }> 
  }> {
    try {
      // Prepare a summary of the document data for the AI
      const documentSummary = documentData.slice(0, 3).map(doc => {
        return {
          title: doc.title,
          status: doc.status,
          priority: doc.priority,
          tags: doc.tags,
          hasAssignee: !!doc.assignedTo,
          hasDueDate: !!doc.dueDate
        };
      });
      
      // Current column setup
      const columnSetup = currentColumns.map(col => col.name).join(', ');
      
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that specializes in optimizing workflows for product managers, 
            designers, and engineers. Your task is to analyze document data and suggest better column 
            layouts for document tables. Focus on creating layouts that help ${userRole}s be more 
            productive based on the types of documents they work with. 
            
            Return a JSON object with a "suggestions" array containing objects with "name", "layout" (array of column keys), 
            and "description" (explaining why this layout is beneficial). Be specific, concise, and practical.`
          },
          {
            role: "user",
            content: `I am a ${userRole} working with these documents: ${JSON.stringify(documentSummary)}. 
            My current column layout is: ${columnSetup}. 
            Suggest 3 better layouts for organizing my document table. Focus on which columns should be displayed 
            and in what order to optimize my workflow.`
          }
        ],
        response_format: { type: "json_object" },
      });

      // Handle potential null content
      const content = response.choices[0].message.content || '{"suggestions":[]}';
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error: any) {
      console.error("Failed to generate column suggestions:", error);
      throw new Error("Failed to generate column suggestions: " + error.message);
    }
  }
}

// Create default instance using XAI as the provider
const aiService = new AIService({ provider: 'xai' });

export default aiService;