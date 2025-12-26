"use server";

import { ai } from "@/app/lib/gemini";
import { Itinerary } from "@/app/lib/types";

export async function generateItinerary(formData: FormData): Promise<{ data?: Itinerary; error?: string }> {
    const prompt = formData.get("prompt") as string;
    const duration = formData.get("duration") as string || "4 hours";
    const vibe = formData.get("vibe") as string || "mixed";

    if (!prompt) return { error: "Please describe what you want into the text box." };

    try {
        const systemPrompt = `
      You are the "Pune Concierge", a hyper-local expert on Pune, India.
      Generate a ${duration} itinerary based on: "${prompt}" and vibe: "${vibe}".
      
      Rules:
      1. Only recommend REAL places in Pune.
      2. Optimize for travel time (group nearby places).
      3. Return strictly valid JSON matching this schema:
      {
        "title": "Creative Title (e.g. 'Date Night in KP')",
        "description": "Short summary of the plan.",
        "total_duration": "${duration}",
        "stops": [
          {
            "time_slot": "10:00 AM",
            "activity": "Brief action verb",
            "tips": "Local insider tip (e.g. 'Try the Mango Mastani')",
            "place": {
              "id": "slug-name",
              "name": "Place Name",
              "description": "Short desc",
              "location": { "lat": 18.5204, "lng": 73.8567, "address": "Short area name" }
            }
          }
        ]
      }
    `;

        // Using the new @google/genai pattern
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const responseText = response.text || null;

        if (!responseText) {
            throw new Error("Empty response from AI");
        }

        console.log("--- DEBUG: Gemini Raw Response ---");
        console.log(responseText);
        console.log("----------------------------------");

        try {
            const parsed = JSON.parse(responseText);
            // Handle case where AI returns an array [Itinerary] instead of Itinerary
            const data = Array.isArray(parsed) ? parsed[0] : parsed;

            // Ensure stops is an array to prevent UI crashes
            if (!Array.isArray(data?.stops)) {
                data.stops = [];
            }
            return { data: data as Itinerary };
        } catch {
            console.error("JSON Parse Error", responseText);
            return { error: "AI returned invalid format. Please try again." };
        }

    } catch (error) {
        console.error("Gemini API Error", error);
        return { error: "Failed to contact the AI spirit of Pune. Try again later." };
    }
}
