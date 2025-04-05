import OpenAI from "openai";
import { AIInsight } from "./ai";

// Initialize the OpenAI client with XAI base URL
const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

/**
 * XAI Service - Handles interactions with xAI's Grok models
 */
export class XAIService {
  /**
   * Analyze research material and extract key insights
   */
  async analyzeResearchMaterial(text: string): Promise<AIInsight> {
    const prompt = `
    Please analyze the following research material and extract key insights and recommendations.
    Research Material: ${text}
    
    Respond with a JSON object in the following format:
    {
      "insights": ["Insight 1", "Insight 2", ...],
      "recommendations": [
        {"title": "Recommendation 1 Title", "description": "Description 1"},
        {"title": "Recommendation 2 Title", "description": "Description 2"},
        ...
      ]
    }
    
    Include 3-5 key insights and 2-3 actionable recommendations.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "grok-2-1212", // Using Grok-2 for text processing
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content ?? '{"insights":[],"recommendations":[]}';
      const result = JSON.parse(content) as AIInsight;
      
      return result;
    } catch (error) {
      console.error("XAI Analysis Error:", error);
      return {
        insights: ["Error analyzing research material"],
        recommendations: [{ 
          title: "Try Again Later", 
          description: "The system encountered an error processing your request." 
        }]
      };
    }
  }

  /**
   * Generate PRD draft based on insights
   */
  async generatePrdDraft(insights: string[], title: string): Promise<string> {
    const prompt = `
    Create a Product Requirements Document (PRD) draft for a product titled "${title}" based on the following insights:
    ${insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n')}
    
    The PRD should include the following sections:
    1. Executive Summary
    2. Problem Statement
    3. Product Goals and Objectives
    4. User Personas
    5. Key Features and Requirements
    6. Success Metrics
    7. Timeline
    
    Format the output as a structured document with proper headings and sections.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content ?? "Failed to generate PRD draft";
    } catch (error) {
      console.error("XAI PRD Generation Error:", error);
      return "Error: Unable to generate PRD draft. Please try again later.";
    }
  }

  /**
   * Generate feature ideas based on a product description
   */
  async generateFeatureIdeas(
    productDescription: string,
    count: number = 5
  ): Promise<{ title: string; description: string }[]> {
    const prompt = `
    Based on the following product description, generate ${count} feature ideas that would enhance the product.
    
    Product Description: ${productDescription}
    
    Respond with a JSON array in the following format:
    [
      {
        "title": "Feature 1 Title",
        "description": "Description of feature 1"
      },
      ...
    ]
    
    Each feature should be innovative, valuable to users, and realistic to implement.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content ?? '[]';
      return JSON.parse(content);
    } catch (error) {
      console.error("XAI Feature Generation Error:", error);
      return [
        {
          title: "Error Generating Features",
          description: "The system encountered an error processing your request."
        }
      ];
    }
  }

  /**
   * Analyze an image and extract key information
   */
  async analyzeImage(base64Image: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "grok-2-vision-1212", // Using Grok-2 vision model for image processing
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail and describe its key elements, context, and any notable aspects that would be relevant for product management. Extract any text visible in the image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content ?? "Failed to analyze image";
    } catch (error) {
      console.error("XAI Image Analysis Error:", error);
      return "Error: Unable to analyze image. Please try again later.";
    }
  }
}

export const xaiService = new XAIService();