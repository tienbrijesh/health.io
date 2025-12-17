import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UserProfile } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    // Vite shims process.env via define in vite.config.ts
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
    
    if (!apiKey) {
      console.error("Titan Engine Critical: API_KEY is undefined in current environment.");
      throw new Error("API_CONFIGURATION_REQUIRED");
    }
    
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const initChat = (userProfile: UserProfile) => {
  try {
    const ai = getAI();
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
  } catch (e) {
    console.warn("Titan Engine: Chat initialization deferred until API Key is present.");
    throw e;
  }
};

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

export const generateDailyPlan = async (userProfile: UserProfile): Promise<string> => {
    try {
        const ai = getAI();
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