
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants.ts';
import { UserProfile } from '../types.ts';

// We do not instantiate GoogleGenAI globally to ensure we use the most up-to-date API key from the environment/dialog
let chatSession: any = null;

/**
 * Initializes a new chat session with the user's profile context.
 * Creates a new GoogleGenAI instance right before setup to avoid stale API keys.
 */
export const initChat = (userProfile: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userContext = `
    User Profile:
    Name: ${userProfile.name}
    Goal: ${userProfile.primaryGoal}
    Diet: ${userProfile.dietPreference}
    Wake Up: ${userProfile.wakeUpTime}
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n" + userContext,
      temperature: 0.7,
    }
  });
};

/**
 * Sends a message to the existing Gemini chat session.
 */
export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("CHAT_SESSION_NOT_INITIALIZED");
  }
  // sendMessage returns a GenerateContentResponse where .text is a property, not a method.
  const result = await chatSession.sendMessage({ message });
  return result.text || "No response received.";
};

/**
 * Generates a one-off daily plan using ai.models.generateContent.
 * Follows the guideline to instantiate GoogleGenAI inside the call.
 */
export const generateDailyPlan = async (userProfile: UserProfile): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a very brief bulleted daily plan for ${userProfile.name} focusing on ${userProfile.primaryGoal}. Include 1 specific Indian meal idea and 1 workout task. Format: Markdown.`;
        
        // Use ai.models.generateContent directly with the model name and prompt.
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        
        // Accessing the .text property of GenerateContentResponse directly.
        return response.text || "Plan generation failed.";
    } catch (e) {
        console.error("Titan OS AI Core Error:", e);
        return "System standby. AI Core currently unavailable.";
    }
};
