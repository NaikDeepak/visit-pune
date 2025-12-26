"use server";

import { ai } from "@/app/lib/gemini";
import { PlaceCategory, PLACE_CATEGORIES } from "@/app/lib/types";

/**
 * Classifies a search query into one of the strict PlaceCategory types.
 * Uses Gemini for semantic understanding if heuristics fail.
 */
export async function classifyQuery(query: string, heuristicResult: string): Promise<PlaceCategory> {
    // 1. If heuristics already found a specific category, trust it (Zero Latency)
    if (heuristicResult !== "general") {
        return heuristicResult as PlaceCategory;
    }

    // 2. Fallback to Gemini for semantic understanding
    try {
        const prompt = `
      You are a classifier for a Tourism Database.
      Classify the following user search query into exactly ONE of these categories:
      [${PLACE_CATEGORIES.map(c => `"${c}"`).join(", ")}]

      Query: "${query}"

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
