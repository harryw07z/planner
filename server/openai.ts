import OpenAI from "openai";

// Using GrokAI (xAI) instead of OpenAI as requested
const grokAI = new OpenAI({ 
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY 
});

// Analyze research material and extract key insights
export async function analyzeResearchMaterial(text: string): Promise<{
  insights: string[];
  recommendations: { title: string; description: string }[];
}> {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212", // Using Grok-2 model
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

// Generate PRD draft based on insights
export async function generatePrdDraft(insights: string[], title: string): Promise<string> {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212", // Using Grok-2 model
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

export default {
  analyzeResearchMaterial,
  generatePrdDraft,
};
