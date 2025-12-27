"use server";

import { getAdminDb } from "@/app/lib/firebase-admin";
import { EventData } from "./get-events"; // Reusing the type
import { FieldPath } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";

export interface FetchEventsResult {
    events: (EventData & { startDateVal: number })[];
    nextCursor?: string;
}

interface CursorData {
    s: number;
    t: number;
    i: string;
}

/**
 * Encodes a composite cursor for stable pagination across sorted/sponsored results.
 */
function encodeCursor(event: EventData & { isSponsored?: boolean, startDateVal: number }): string {
    if (!event.id) {
        throw new Error("Cannot encode cursor: missing event id");
    }
    const cursorData: CursorData = {
        s: event.isSponsored ? 1 : 0,
        t: event.startDateVal,
        i: event.id
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Decodes a cursor string back into composite values.
 */
function decodeCursor(cursor: string): CursorData | null {
    try {
        const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));

        if (typeof decoded !== "object" || decoded === null) return null;

        const casted = decoded as Record<string, unknown>;
        const s = Number(casted.s);
        const t = Number(casted.t);
        const i = String(casted.i ?? "");

        if (!Number.isFinite(s) || !Number.isFinite(t) || !i) return null;

        return { s, t, i };
    } catch {
        return null;
    }
}

export async function fetchEventsFromFirestore(cursor?: string): Promise<FetchEventsResult> {
    try {
        const db = getAdminDb();
        const PAGE_SIZE = 24;
        const decoded = cursor ? decodeCursor(cursor) : null;

        let query = db.collection("events")
            .where("isActive", "==", true)
            .orderBy("isSponsored", "desc")
            .orderBy("startDate", "asc")
            .orderBy(FieldPath.documentId(), "asc");

        if (decoded) {
            query = query.startAfter(
                decoded.s === 1,
                Timestamp.fromMillis(decoded.t),
                decoded.i
            );
        }

        const snapshot = await query.limit(PAGE_SIZE).get();

        const cleanedEvents = snapshot.docs.map(doc => {
            const data = doc.data() as Record<string, unknown>;

            // We use standard coercion but trust the Sync path has normalized these.
            // This mapping layer exists purely to transform Firestore Docs -> Frontend Props.
            const startDate = data.startDate as Timestamp;

            return {
                id: doc.id,
                title: String(data.title || "Untitled"),
                description: String(data.description || ""),
                link: String(data.link || "#"),
                thumbnail: String(data.thumbnail || ""),
                address: Array.isArray(data.address) ? data.address : [],
                venue: { name: String(data.venue || "") },
                date: {
                    start_date: data.dateDisplay ? String(data.dateDisplay) : startDate.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                    when: data.dateDisplay ? String(data.dateDisplay) : undefined
                },
                startDateVal: startDate.toMillis(),
            } as EventData & { startDateVal: number };
        });

        const nextCursor = snapshot.docs.length === PAGE_SIZE
            ? (() => {
                const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                const lastData = lastDoc.data() as Record<string, unknown>;
                const lastStartDate = lastData.startDate as Timestamp;

                return encodeCursor({
                    id: lastDoc.id,
                    isSponsored: Boolean(lastData.isSponsored),
                    startDateVal: lastStartDate.toMillis(),
                    title: "", // Placeholder
                    date: {}, // Placeholder
                    address: [], // Placeholder
                    link: "", // Placeholder
                });
            })()
            : undefined;

        return { events: cleanedEvents, nextCursor };

    } catch (error) {
        console.error("Firestore Fetch Error", error);
        return { events: [] };
    }
}
