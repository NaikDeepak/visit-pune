"use server";

import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, limit, where } from "firebase/firestore";
import { Place } from "@/app/lib/types";

export async function getPlaces(vibe?: string): Promise<{ data?: Place[]; error?: string }> {
    try {
        const placesRef = collection(db, "places");
        // Ideally we filter by vibe, but our schema doesn't strictly have 'vibe' tags yet in the Seeder. 
        // For now, we fetch top 20 and filter client side or let it be generic. 
        // In a real app, we would add 'tags' array to schema.

        // Filter by category if provided
        let q;
        if (vibe) {
            q = query(placesRef, where("category", "==", vibe), limit(50));
        } else {
            q = query(placesRef, limit(50));
        }

        const snapshot = await getDocs(q);

        const places = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as Place[];

        return { data: places };
    } catch (error) {
        console.error("Firestore Fetch Error", error);
        return { error: "Failed to load places." };
    }
}
