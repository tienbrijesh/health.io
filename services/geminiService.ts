
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UserProfile } from '../types';

// Initialize the GoogleGenAI client using process.env.API_KEY directly as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatSession: Chat | null = null;

/**
 * Initializes a chat session with user-specific context and the system instruction.
 * Follows the guidelines for creating a chat session.
 */
export const initChat = (userProfile: UserProfile) => {
  const userContext = `
    User Profile:
    Name: ${userProfile.name}
    Goal: ${userProfile.primaryGoal}
    Diet: ${userProfile.dietPreference}
    Wake Up: ${userProfile.wakeUpTime}
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n" + userContext,
      temperature: 0.7,
    }
  });
};

/**
 * Sends a message to the existing chat session and returns the text response.
 * Uses result.text property as per guidelines.
 */
export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("CHAT_SESSION_NOT_INITIALIZED");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    const text = result.text;
    
    if (!text) {
        throw new Error("EMPTY_AI_RESPONSE");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API Transmission Error:", error);
    throw error;
  }
};

/**
 * Generates a daily plan using ai.models.generateContent directly as required for non-chat tasks.
 */
export const generateDailyPlan = async (userProfile: UserProfile): Promise<string> => {
    try {
        const prompt = `Generate a very brief bulleted daily plan for ${userProfile.name} focusing on ${userProfile.primaryGoal}. Include 1 specific Indian meal idea and 1 workout task. Format: Markdown.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text || "Plan generation failed.";
    } catch (e) {
        console.error("Titan Kernel: Daily Plan Generation Failed.", e);
        return "System standby. AI Core currently unavailable. Maintain your current protocol.";
    }
};
