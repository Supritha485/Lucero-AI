import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;

function getChatInstance(): Chat {
    if (!chat) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a friendly and helpful AI chatbot named Lucero AI. Your previous name was RuleBot, but you've been upgraded with a powerful AI model. Keep your responses concise and conversational.",
            }
        });
    }
    return chat;
}

export async function getBotResponse(message: string): Promise<string> {
    try {
        const chatSession = getChatInstance();
        const response: GenerateContentResponse = await chatSession.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error getting AI response:", error);
        return "Oops! Something went wrong on my end. I can't connect to my brain right now. Please try again in a moment.";
    }
}

export function resetChat() {
    chat = null;
}