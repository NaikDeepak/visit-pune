import { GoogleGenAI } from "@google/genai";

// Ensure AI is only initialized on server side to protect API Key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY in environment variables. AI features will fail.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
