"use server";

import { db } from "@/app/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { classifyQuery } from "./classify-category";
import { Place, PlaceCategory } from "@/app/lib/types";

/**
 * Backfill script to add category tags to existing places.
 * Targets places that either:
 * 1. Don't have a category field
 * 2. Have category set to "general"
 * 
 * Uses AI classification based on place name for accuracy.
 */
export async function backfillCategories(): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    failed: number;
    errors: string[];
}> {
    const results = {
        success: false,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[]
    };

    try {
        // 1. Fetch all places
        const placesRef = collection(db, "places");
        const snapshot = await getDocs(placesRef);

        console.log(`[Migration] Found ${snapshot.size} total places`);

        // 2. Process each place
        for (const docSnapshot of snapshot.docs) {
            const place = docSnapshot.data() as Place;
            const placeId = docSnapshot.id;

            // Skip if already has a specific category
            if (place.category && place.category !== "general") {
                results.skipped++;
                console.log(`[Migration] Skipping ${place.name} (already has category: ${place.category})`);
                continue;
            }

            try {
                // 3. Use place name as classification input
                const query = place.name;
                const newCategory = await classifyQuery(query, "general");

                // 4. Update document
                await updateDoc(doc(db, "places", placeId), {
                    category: newCategory
                });

                results.updated++;
                console.log(`[Migration] ✓ Updated ${place.name} → ${newCategory}`);

            } catch (error: any) {
                results.failed++;
                const errorMsg = `Failed to update ${place.name}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`[Migration] ✗ ${errorMsg}`);
            }
        }

        results.success = results.failed === 0;
        console.log(`[Migration] Complete: ${results.updated} updated, ${results.skipped} skipped, ${results.failed} failed`);

        return results;

    } catch (error: any) {
        results.errors.push(`Migration failed: ${error.message}`);
        console.error("[Migration] Critical error:", error);
        return results;
    }
}
