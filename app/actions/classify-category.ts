"use server";

import { ai } from "@/app/lib/gemini";
import { PlaceCategory, PLACE_CATEGORIES } from "@/app/lib/types";

/**
 * Sanitizes user input to prevent prompt injection attacks.
 * Removes or escapes characters that could manipulate the AI prompt.
 */
function sanitizeQuery(query: string): string {
    // Limit length to prevent abuse
    const maxLength = 200;
    let sanitized = query.slice(0, maxLength);
    
    // Remove control characters and non-printable characters (includes \n, \r, \t)
    sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    
    // Escape backslashes first to prevent escape sequence issues
    sanitized = sanitized.replace(/\\/g, '\\\\');
    
    // Escape quotes to prevent breaking out of prompt context
    sanitized = sanitized.replace(/"/g, '\\"');
    sanitized = sanitized.replace(/'/g, "\\'");
    
    // Collapse multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
}

/**
 * Classifies a search query into one of the strict PlaceCategory types.
 * Uses Gemini for semantic understanding if heuristics fail.
 */
export async function classifyQuery(query: string, heuristicResult: string): Promise<PlaceCategory> {
    // 1. If heuristics already found a specific category, trust it (Zero Latency)
    if (heuristicResult !== "general") {
        return heuristicResult as PlaceCategory;
    }

    // 2. Sanitize input to prevent prompt injection
    const sanitizedQuery = sanitizeQuery(query);
    
    // If query becomes empty after sanitization, return general
    if (!sanitizedQuery) {
        return "general";
    }

    // 3. Fallback to Gemini for semantic understanding
    try {
        const prompt = `
      You are a classifier for a Tourism Database.
      Classify the following user search query into exactly ONE of these categories:
      [${PLACE_CATEGORIES.map(c => `"${c}"`).join(", ")}]

      Query: "${sanitizedQuery}"

      Rules:
      - Return ONLY the category name as a plain string.
      - If "forts", "wadas", "temples" -> "history"
      - If "restaurants", "street food", "cafes" -> "food"
      - If "gardens", "hills", "trekking" -> "nature"
      - If "pubs", "bars", "clubs" -> "nightlife"
      - If unclear, return "general".
    `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        const text = response.text?.trim().toLowerCase();

        // Validate output
        if (PLACE_CATEGORIES.includes(text as PlaceCategory)) {
            return text as PlaceCategory;
        }

        return "general";

    } catch (error) {
        console.error("AI Classification Failed:", error);
        return "general";
    }
}
