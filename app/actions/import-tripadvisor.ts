"use server";

import { getAdminDb } from "@/app/lib/firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { Place, PlaceCategory } from "@/app/lib/types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type ImportResult = {
    success: number;
    failed: number;
    skipped: number;
    logs: string[];
};

export async function importTripAdvisorData(jsonString: string): Promise<ImportResult> {
    const adminDb = getAdminDb();
    const logs: string[] = [];
    let success = 0;
    let failed = 0;
    let skipped = 0;

    try {
        const data = JSON.parse(jsonString);
        logs.push("✅ JSON Parsed successfully.");

        // Aggregate all potential places
        const candidates = [
            ...(data.place_result ? [data.place_result] : []),
            ...(data.place_result?.attraction_suggestions?.items || []),
            ...(data.hotel_suggestions?.items || []),
            ...(data.restaurant_suggestions?.items || [])
        ];

        logs.push(`Found ${candidates.length} candidates to process.`);

        for (const item of candidates) {
            try {
                // 1. Check if exists
                const existing = await adminDb.collection("places")
                    .where("name", "==", item.name)
                    .get();

                if (!existing.empty) {
                    logs.push(`⚠️ Skipped "${item.name}" - Already exists.`);
                    skipped++;
                    continue;
                }

                // 2. Classify & Rewrite Description using Gemini
                const rawDescription = item.description || `A popular spot in Pune with ${item.reviews || 0} reviews and a rating of ${item.rating || "N/A"}. Known for ${item.categories?.join(", ") || "its ambiance"}.`;

                // Prompt engineering for data enrichment
                const prompt = `
                    You are a travel editor for "VisitPune.in".
                    write a SHORT, CAPTIVATING description (max 2 sentences) for a place named "${item.name}" in Pune.
                    
                    Context:
                    - Type: ${item.type || "Place"}
                    - Raw Categories: ${JSON.stringify(item.categories || item.cuisines || [])}
                    - Rating: ${item.rating}
                    - Price Level: ${item.price_level || "N/A"}
                    
                    Also, strictly classify it into ONE of these categories: history, food, nature, nightlife, books, culture, general.
                    
                    Output JSON format:
                    {
                        "description": "...",
                        "category": "..."
                    }
                `;

                const aiRes = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                const enriched = JSON.parse(aiRes.text || "{}");

                // 3. Map Price Level
                let priceLevel = 1;
                if (item.price_level) {
                    // "$$$$" -> 4, "$$" -> 2
                    priceLevel = item.price_level.length;
                } else if (item.price) {
                    // Primitive heuristic based on USD price if available, largely guess for hotels
                    priceLevel = item.price > 100 ? 4 : item.price > 50 ? 3 : 2;
                }

                // 4. Construct Place Object
                const newPlace: Place = {
                    id: crypto.randomUUID(),
                    name: item.name,
                    description: enriched.description || rawDescription,
                    location: {
                        lat: 18.5204, // Default to Pune center if missing (TripAdvisor JSON often lacks lat/lng in summary list)
                        lng: 73.8567,
                        address: item.address || "Pune, Maharashtra, India"
                    },
                    image_url: item.thumbnail || item.images?.[0] || null,
                    rating: parseFloat(item.rating) || 4.0,
                    reviews: parseInt(String(item.reviews || 0), 10),
                    category: (enriched.category as PlaceCategory) || "general",
                    price_level: priceLevel,
                    estimated_time: "1-2 hours" // Default
                };

                // 5. Save to Firestore
                await adminDb.collection("places").doc(newPlace.id).set(newPlace);
                logs.push(`✅ Imported: ${newPlace.name} (${newPlace.category})`);
                success++;

            } catch (err) {
                console.error(err);
                logs.push(`❌ Failed to process "${item.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
                failed++;
            }
        }

    } catch (e) {
        logs.push(`❌ CRITICAL: Invalid JSON format. ${e instanceof Error ? e.message : ""}`);
        failed++;
    }

    return { success, failed, skipped, logs };
}
