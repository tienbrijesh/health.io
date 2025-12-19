import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UserProfile } from '../types';

let chatSession: any = null;

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
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n" + userContext,
      temperature: 0.7,
    }
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("CHAT_SESSION_NOT_INITIALIZED");
  }
  const result = await chatSession.sendMessage({ message });
  return result.text || "No response received.";
};

export const generateDailyPlan = async (userProfile: UserProfile): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a very brief bulleted daily plan for ${userProfile.name} focusing on ${userProfile.primaryGoal}. Include 1 specific Indian meal idea and 1 workout task. Format: Markdown.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        
        return response.text || "Plan generation failed.";
    } catch (e) {
        console.error("Titan OS AI Core Error:", e);
        return "System standby. AI Core currently unavailable.";
    }
};
