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

        const fetchWithQuery = async (useCompositeIndex: boolean) => {
            let query = db.collection("events") as FirebaseFirestore.Query;

            if (useCompositeIndex) {
                // SCALABLE QUERY (Requires Index)
                // Index: isActive (ASC), isSponsored (DESC), startDate (ASC), __name__ (ASC)
                query = query
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

                query = query.limit(PAGE_SIZE);
            } else {
                // FALLBACK QUERY (No Index needed)
                // We fetch a larger batch and handle ordering/cursor in memory
                query = query.orderBy("startDate", "asc").limit(500);
            }

            return query.get();
        };

        let snapshot: FirebaseFirestore.QuerySnapshot;
        let usedComposite = false;

        try {
            snapshot = await fetchWithQuery(true);
            usedComposite = true;
        } catch (error: unknown) {
            const err = error as { code?: number, message?: string };
            if (err.code === 9 || err.message?.includes("FAILED_PRECONDITION")) {
                console.warn("⚠️ [PERFORMANCE] Missing Index for composite pagination. Falling back to in-memory.");
                snapshot = await fetchWithQuery(false);
            } else {
                throw error;
            }
        }

        const allFetchedEvents = snapshot.docs.map(doc => {
            const data = doc.data() as {
                title?: string;
                description?: string;
                link?: string;
                thumbnail?: string;
                address?: unknown;
                venue?: string;
                dateDisplay?: string;
                startDate?: Timestamp;
                isActive?: boolean;
                isSponsored?: boolean;
            };

            const startDate = data.startDate;
            if (!startDate || typeof (startDate as unknown as Record<string, unknown>).toDate !== "function") {
                return null;
            }

            return {
                id: doc.id,
                title: data.title || "Untitled Event",
                description: data.description || "",
                link: data.link || "#",
                thumbnail: data.thumbnail || "",
                address: Array.isArray(data.address) ? data.address : (data.address ? [String(data.address)] : []),
                venue: { name: data.venue || "" },
                date: {
                    start_date: data.dateDisplay || startDate.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                    when: data.dateDisplay
                },
                startDateVal: startDate.toMillis(),
                isActive: data.isActive ?? true,
                isSponsored: data.isSponsored ?? false
            };
        }).filter((e): e is NonNullable<typeof e> => e !== null);

        let sortedEvents = allFetchedEvents;

        if (!usedComposite) {
            // Manual Sort: Sponsored first, then Date, then ID
            sortedEvents = allFetchedEvents
                .filter(e => e.isActive === true)
                .sort((a, b) => {
                    if (a.isSponsored && !b.isSponsored) return -1;
                    if (!a.isSponsored && b.isSponsored) return 1;
                    if (a.startDateVal !== b.startDateVal) return a.startDateVal - b.startDateVal;
                    return a.id.localeCompare(b.id);
                });

            // Manual Slicing based on cursor
            if (decoded) {
                const lastIndex = sortedEvents.findIndex(e =>
                    e.id === decoded.i &&
                    e.startDateVal === decoded.t &&
                    (e.isSponsored ? 1 : 0) === decoded.s
                );
                if (lastIndex !== -1) {
                    sortedEvents = sortedEvents.slice(lastIndex + 1);
                }
            }
            sortedEvents = sortedEvents.slice(0, PAGE_SIZE);
        }

        // Cleanup and generate next cursor
        const cleanedEvents = sortedEvents.map(e => ({
            ...e,
            isActive: undefined,
            isSponsored: undefined
        } as EventData & { startDateVal: number }));

        const nextCursor = sortedEvents.length === PAGE_SIZE
            ? encodeCursor(sortedEvents[sortedEvents.length - 1])
            : undefined;

        return { events: cleanedEvents, nextCursor };

    } catch (error) {
        console.error("Firestore Fetch Error", error);
        return { events: [] };
    }
}
