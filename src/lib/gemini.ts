import { GoogleGenAI, Type } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const MODELS = {
  DEFAULT: "gemini-3-flash-preview",
};

export interface AIResponse {
  summary: string;
  actionItems: string[];
  suggestedTitle: string;
}

export async function generateNoteInsights(content: string): Promise<AIResponse> {
  const prompt = `
    Analyze the following note content and provide:
    1. A concise, professional executive summary (max 2 sentences).
    2. A list of specific actionable items extracted from the text.
    3. A suggested catchy and relevant title.

    Note content:
    """
    ${content}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.DEFAULT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A professional 2-sentence summary."
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of next steps or tasks."
            },
            suggestedTitle: {
              type: Type.STRING,
              description: "A refined title for the document."
            }
          },
          required: ["summary", "actionItems", "suggestedTitle"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insights generation failed:", error);
    return {
      summary: "Could not generate intelligence report for this document.",
      actionItems: [],
      suggestedTitle: "Untitled Note"
    };
  }
}
