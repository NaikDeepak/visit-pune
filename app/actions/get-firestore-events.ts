"use server";

import { getAdminDb } from "@/app/lib/firebase-admin";
import { EventData } from "./get-events"; // Reusing the type
import { Timestamp } from "firebase-admin/firestore";

export async function fetchEventsFromFirestore(lastDate?: number): Promise<{ events: (EventData & { startDateVal: number })[], nextCursor?: number }> {
    try {
        const db = getAdminDb();

        // SIMPLIFIED QUERY TO AVOID COMPOSITE INDEX ERROR
        // !IMPORTANT: This is technical debt.
        // We fetch by date, and filter/sort in memory.
        // LIMITATION: If we have > 500 events, active events might be missed if they are "old" but active?
        // FIX: Create Firestore Composite Index: `isActive ASC, isSponsored DESC, startDate ASC`
        let query = db.collection("events")
            .orderBy("startDate", "asc")
            .limit(100); // Fetch more since we need to filter locally

        if (lastDate) {
            query = query.startAfter(Timestamp.fromMillis(lastDate));
        }

        const snapshot = await query.get();

        const events = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    link: data.link,
                    thumbnail: data.thumbnail,
                    address: data.address,
                    venue: { name: data.venue },
                    date: {
                        start_date: data.dateDisplay || data.startDate.toDate().toDateString(),
                        when: data.dateDisplay
                    },
                    startDateVal: data.startDate.toMillis(),
                    isActive: data.isActive ?? true, // Default to true if missing
                    isSponsored: data.isSponsored ?? false
                };
            })
            // In-Memory Filter
            .filter(e => e.isActive === true)
            // In-Memory Sort (Sponsored first, then by date which is already roughly sorted but let's be safe)
            .sort((a, b) => {
                if (a.isSponsored && !b.isSponsored) return -1;
                if (!a.isSponsored && b.isSponsored) return 1;
                return a.startDateVal - b.startDateVal;
            })
            // Map to final type
            .map(e => ({
                ...e,
                isActive: undefined, // Cleanup if not needed in UI
                isSponsored: undefined
            } as EventData & { startDateVal: number }));

        // Pagination might be tricky with in-memory filtering if we use limits.
        // For now, let's just return the top 24. 
        // Ideally we fetch more than 24 (done above: 100) to ensure we fill the page.

        const slicedEvents = events.slice(0, 24);
        const nextCursor = slicedEvents.length > 0 ? slicedEvents[slicedEvents.length - 1].startDateVal : undefined;

        return { events: slicedEvents, nextCursor };

    } catch (error) {
        console.error("Firestore Fetch Error", error);
        return { events: [] };
    }
}
