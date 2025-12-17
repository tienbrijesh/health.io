import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UserProfile } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY not found in environment variables");
      throw new Error("API Key missing");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const initChat = (userProfile: UserProfile) => {
  const ai = getAI();
  
  const userContext = `
    User Profile:
    Name: ${userProfile.name}
    Goal: ${userProfile.primaryGoal}
    Diet: ${userProfile.dietPreference}
    Wake Up: ${userProfile.wakeUpTime}
  `;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n" + userContext,
      temperature: 0.7,
    }
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please refresh.");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    const text = result.text;
    
    if (!text) {
        throw new Error("Empty response from AI. Safety filters may have been triggered.");
    }
    
    return text;
  } catch (error) {
    // Rethrow error so the component can handle it
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateDailyPlan = async (userProfile: UserProfile): Promise<string> => {
    const ai = getAI();
    const prompt = `Generate a very brief bulleted daily plan for ${userProfile.name} focusing on ${userProfile.primaryGoal}. Include 1 specific Indian meal idea and 1 workout task. Format: Markdown.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text || "Plan generation failed.";
    } catch (e) {
        return "Could not generate daily brief.";
    }
};