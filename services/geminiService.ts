import { GoogleGenAI, Chat, GenerateContentStreamResult } from "@google/genai";
import { TEXT_MODEL, SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const sendMessageStream = async (
  history: Message[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getClient();
  
  // Transform history for the SDK
  // We exclude the last message which is the new one being sent if it was added to UI state already
  // or we just trust the component to pass previous history. 
  // Here we assume 'history' contains previous messages.
  
  const chatHistory = history.map(msg => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const chat: Chat = ai.chats.create({
    model: TEXT_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: chatHistory
  });

  const resultStream = await chat.sendMessageStream({ message: newMessage });
  
  let fullText = "";
  for await (const chunk of resultStream) {
    const text = chunk.text || "";
    fullText += text;
    onChunk(text);
  }

  return fullText;
};

export const generateTitle = async (firstMessage: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Summarize this user query into a short, 3-5 word title for a chat history (in Russian): "${firstMessage}"`,
        });
        return response.text?.trim() || "Новый чат";
    } catch (e) {
        return "Новый чат";
    }
}

// Law Reader Services
export interface TOCItem {
  id: string;
  title: string;
}

export const fetchLawTOC = async (lawName: string): Promise<TOCItem[]> => {
  try {
    const ai = getClient();
    const prompt = `
      Create a structured Table of Contents for '${lawName}' of the Republic of Uzbekistan.
      Return ONLY a JSON array of objects with 'id' (numbered string like "1", "2") and 'title' (string) properties for the main Parts or Chapters.
      Do not include sub-articles. Keep it high-level (max 15 items).
      Output strictly JSON.
    `;
    
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Error fetching TOC", e);
    // Fallback data if AI fails
    return [
      { id: "1", title: "Общие положения" },
      { id: "2", title: "Основные понятия" },
      { id: "3", title: "Права и обязанности" },
      { id: "4", title: "Заключительные положения" }
    ];
  }
};

export const fetchLawContent = async (lawName: string, sectionTitle: string, onChunk: (text: string) => void): Promise<void> => {
  const ai = getClient();
  const prompt = `
    Provide the detailed text content for the section "${sectionTitle}" of the document "${lawName}" (Legislation of Uzbekistan).
    Format the output in clean Markdown.
    Use bold for Article numbers (e.g., **Статья 1.**).
    Be accurate and professional. If the text is very long, summarize the key articles but keep the legal tone.
    Do not add conversational filler. Start directly with the content.
  `;

  const responseStream = await ai.models.generateContentStream({
    model: TEXT_MODEL,
    contents: prompt
  });

  for await (const chunk of responseStream) {
    const text = chunk.text || "";
    onChunk(text);
  }
};