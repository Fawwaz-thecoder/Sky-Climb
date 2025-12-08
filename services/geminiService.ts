
import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return genAI;
};

export const initializeChat = async () => {
  const ai = getAI();
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are Clamber, an enthusiastic parkour coach and guide for the game 'SkyClimb'. You help players with tips, explain game mechanics (jump on platforms, avoid falling, collect coins), and keep the mood high. You are witty and energetic. Keep responses short and helpful.",
    },
  });
  return chatSession;
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }
  try {
    const result = await chatSession!.sendMessage({ message });
    return result.text || "I'm having trouble holding on! Try again.";
  } catch (error) {
    console.error("Chat Error", error);
    return "Connection slip! Couldn't reach the summit server.";
  }
};

export const getDailyParkourFact = async (): Promise<{ text: string, sources: {uri: string, title: string}[] }> => {
  const ai = getAI();
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Tell me a fascinating, recent or historical fact about parkour, climbing, or physics related to jumping. Keep it under 2 sentences.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web) || [];

    return {
      text: result.text || "Parkour is about efficiency and momentum!",
      sources: sources as {uri: string, title: string}[],
    };
  } catch (error) {
    console.error("Search Error", error);
    return { text: "Did you know? Parkour was developed from military obstacle course training.", sources: [] };
  }
};

export const getGameImprovementTips = async (): Promise<string[]> => {
    const ai = getAI();
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: "List 5 concise, actionable points to improve a vertical platformer web game to make it more profitable and engaging. Focus on monetization and user retention.",
             config: {
                responseMimeType: "application/json",
             }
        });
        // Attempt to parse JSON list, or fallback to splitting lines if model ignores JSON
        try {
            const data = JSON.parse(result.text || '[]');
            if (Array.isArray(data)) return data;
            if (data.points && Array.isArray(data.points)) return data.points;
            return ["Add multiplayer races", "Daily login rewards", "Custom level editor", "Seasonal leaderboards", "Premium skins pass"];
        } catch (e) {
            return (result.text || '').split('\n').filter(l => l.trim().length > 0).slice(0, 5);
        }
    } catch (e) {
        return ["Optimize performance", "Add social sharing", "Create a competitive league", "Implement interstitial ads wisely", "Add power-ups"];
    }
}
