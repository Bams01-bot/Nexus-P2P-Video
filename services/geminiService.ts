
import { GoogleGenAI } from "@google/genai";

export const getGeminiAssistantResponse = async (userPrompt: string, context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: You are a professional meeting assistant in a P2P video call.
      Current context of the meeting or chat: ${context}
      
      User request: ${userPrompt}`,
      config: {
        systemInstruction: "Keep responses helpful, concise, and professional. You act as a participant in the meeting.",
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI assistant.";
  }
};
