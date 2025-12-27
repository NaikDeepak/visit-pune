import "server-only";
import { getAdminDb } from "@/app/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as chrono from "chrono-node";
import { fetchHighResImage } from "./image-util";

const API_KEY = process.env.SERPAPI_KEY;

interface SyncStats {
    added: number;
    updated: number;
    removed: number;
    skipped: number;
}

// SerpApi Type Definitions
interface SerpApiEvent {
    title: string;
    description?: string;
    link?: string;
    thumbnail?: string;
    image?: string;
    address?: string[];
    venue?: { name: string; rating?: number; reviews?: number };
    date?: {
        start_date?: string;
        when?: string;
    };
    event_location_map?: {
        image?: string;
        link?: string;
    };
}

export async function syncEventsService(triggeredBy: string) {
    const db = getAdminDb();
    const stats: SyncStats = { added: 0, updated: 0, removed: 0, skipped: 0 };
    const logId = db.collection("sync_logs").doc().id;

    try {
        // 1. Fetch from SerpApi (Pagination Loop)
        if (!API_KEY) throw new Error("Missing SERPAPI_KEY");

        const allEvents: SerpApiEvent[] = [];
        let start = 0;
        const LIMIT = 100;

        // Loop until we reach limit or exhaust results
        while (allEvents.length < LIMIT) {
            const params = new URLSearchParams({
                engine: "google_events",
                q: "Events in Pune",
                hl: "en",
                gl: "in",
                api_key: API_KEY,
                start: start.toString(),
            });

            console.info(`Fetching SerpApi offset ${start}...`);
            const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
            if (!response.ok) {
                console.error(`SerpApi failed status: ${response.status}`);
                break;
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const pageEvents: SerpApiEvent[] = data.events_results || [];
            if (pageEvents.length === 0) break; // No more results

            // Filter for new events to avoid infinite loops if API returns duplicates
            // We just concat for now and dedupe later logic handles it
            allEvents.push(...pageEvents);

            start += 10; // Default page size for Google Events is typically 10

            // Safety break just in case
            if (start > 200) break;
        }

        const results = allEvents.slice(0, LIMIT); // Ensure strict cap
        console.info(`Total events fetched: ${results.length}`);

        // 2. Scalable Cleanup Past Events (Batched)
        const now = new Date();
        const pastEventsRef = db.collection("events")
            .where("startDate", "<", Timestamp.fromDate(now))
            .limit(500); // Process in chunks of 500

        while (true) {
            const snapshot = await pastEventsRef.get();
            if (snapshot.empty) break;

            const batch = db.batch();
            snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                batch.delete(doc.ref);
                stats.removed++;
            });
            await batch.commit();
            console.info(`Cleaned up ${snapshot.size} past events.`);
        }


        // 3. Process & Write New Events
        const batch = db.batch();

        for (const event of results) {
            // Generate Dedup ID
            // Ideally we use a stable ID from source. SerpApi doesn't always strictly guarantee one, 
            // but link + title is a decent proxy.
            const idString = `${event.title}-${event.date?.start_date}`;
            const docId = Buffer.from(idString).toString('base64').replace(/[+/=]/g, '');

            const eventRef = db.collection("events").doc(docId);
            const docSnap = await eventRef.get();

            // High-Res Image Logic
            // Prioritize 'image' over 'thumbnail' as it is often higher quality in SerpApi
            let imageUrl = event.image || event.thumbnail || "";

            if (imageUrl) {
                // If it's a low-res Google thumbnail (encrypted-tbn0), try to scrape the source
                if (imageUrl.includes("encrypted-tbn0") && event.link) {
                    // Only fetch if we have a valid link
                    const scrapedImage = await fetchHighResImage(event.link);
                    if (scrapedImage) {
                        // Debug level is better for item-level details
                        // console.debug(`Upgraded image for ${event.title.substring(0, 15)}...`);
                        imageUrl = scrapedImage;
                    }
                }

                try {
                    // 1. Handle lh3/lh5/googleusercontent (Resizing allowed)
                    if (imageUrl.includes("googleusercontent.com") || imageUrl.includes("=w")) {
                        // Replace existing size params or append if missing
                        if (imageUrl.match(/=w\d+/)) {
                            imageUrl = imageUrl.replace(/=w\d+(-h\d+)?/, "=w1080-h1080");
                        }
                    }
                } catch {
                    // Ignore logic failure
                }
            }

            // Robust Date Parsing with Chrono
            let startDate = new Date(); // Default fallback
            const now = new Date();

            // SerpApi date object usually has `start_date` like "Jan 14"
            const rawDate = event.date?.start_date;

            if (rawDate) {
                // Parsing "Jan 14" without year defaults to *next* Jan 14 usually, or checks proximity.
                // We explicitly bias towards future if ambiguous, but chrono handles "Jan 14" relative to 'now' intelligently.
                const parsedDate = chrono.parseDate(rawDate);
                if (parsedDate) {
                    startDate = parsedDate;
                }
            }

            // FILTER: If event is in the past, skip/mark inactive
            // Safest: If startDate is before 'now' (minus small buffer), don't add as active.
            if (startDate < now) {
                // Debug log
                // console.debug(`Skipping past event: ${event.title} (${startDate.toISOString()})`);
                stats.skipped++;
                continue;
            }

            // Debug Log
            // console.debug(`Processing: ${event.title.substring(0, 20)}... | Date: ${startDate.toISOString()} | ID: ${docId}`);

            const eventData = {
                title: event.title,
                description: event.description || "",
                link: event.link,
                thumbnail: imageUrl, // Use High-Res
                address: event.address || [],
                venue: event.venue?.name || "",
                dateDisplay: event.date?.when || event.date?.start_date,
                startDate: Timestamp.fromDate(startDate),
                tags: ["Pune"],
                updatedAt: Timestamp.now(),
                metadata: {
                    source: "serpapi",
                    originalData: event
                }
            };

            if (docSnap.exists) {
                // Update - preserve existing flags if present, otherwise default
                const currentData = docSnap.data();
                batch.update(eventRef, {
                    ...eventData,
                    isActive: currentData?.isActive ?? true,
                    isSponsored: currentData?.isSponsored ?? false,
                    isHighlighted: currentData?.isHighlighted ?? false
                });
                stats.updated++;
            } else {
                // Create - Set defaults
                batch.set(eventRef, {
                    ...eventData,
                    isActive: true, // Default to visible
                    isSponsored: false,
                    isHighlighted: false,
                    createdAt: Timestamp.now()
                });
                stats.added++;
            }
        }

        await batch.commit();

        // 4. Log Success
        await db.collection("sync_logs").doc(logId).set({
            triggeredBy,
            timestamp: Timestamp.now(),
            status: "success",
            stats
        });

        return { success: true, stats };

    } catch (error) {
        console.error("Sync Logic Failed:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Log Failure
        await db.collection("sync_logs").doc(logId).set({
            triggeredBy,
            timestamp: Timestamp.now(),
            status: "failure",
            error: errorMessage,
            stats
        });
        throw error;
    }
}
