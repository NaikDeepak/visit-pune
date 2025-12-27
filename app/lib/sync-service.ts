import "server-only";
import { getAdminDb, getAdminStorage } from "@/app/lib/firebase-admin";
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
    address?: string | string[]; // Allow string for legacy/api variations
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

/**
 * Strict schema for Event documents in Firestore.
 * All write paths must adhere to this to simplify the read layer.
 */
interface FirestoreEventDoc {
    title: string;
    description: string;
    link: string;
    thumbnail: string;
    address: string[];
    venue: string;
    dateDisplay: string;
    startDate: Timestamp;
    tags: string[];
    updatedAt: Timestamp;
    createdAt?: Timestamp;
    isActive: boolean;
    isSponsored: boolean;
    isHighlighted: boolean;
    metadata: {
        source: string;
        originalData?: unknown;
    };
}

/**
 * Downloads an external image and uploads it to Firebase Storage for persistence and security.
 */
async function uploadImageToStorage(imageUrl: string, docId: string): Promise<string | null> {
    try {
        const response = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const storage = getAdminStorage();
        const bucket = storage.bucket();

        // We always save with .jpg extension for internal consistency, 
        // but the metadata reflects the actual source type.
        const file = bucket.file(`event-images/${docId}.jpg`);

        await file.save(Buffer.from(buffer), {
            metadata: {
                contentType,
                metadata: {
                    sourceUrl: imageUrl,
                    syncedAt: new Date().toISOString()
                }
            },
            predefinedAcl: "publicRead",
            resumable: false
        });

        const bucketName = bucket.name;
        // Direct Google Storage Public URL is more reliable for 'public: true' files
        // and doesn't require Firebase Security Rules to be configured for public read.
        return `https://storage.googleapis.com/${bucketName}/event-images/${docId}.jpg`;
    } catch (error) {
        console.error("Failed to persist image to internal storage", { imageUrl, docId, error });
        return null;
    }
}

export async function syncEventsService(triggeredBy: string, forceImageResync: boolean = false) {
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

            // Safety break just in case - align with LIMIT to avoid excessive pagination
            if (start >= 150) break;
        }

        const results = allEvents.slice(0, LIMIT); // Ensure strict cap
        console.info(`Total events fetched: ${results.length}`);

        // 2. Scalable Cleanup Past Events (Batched)
        // 2. Scalable Cleanup Past Events (Batched)
        const now = new Date();
        const pastEventsQuery = () => db.collection("events")
            .where("startDate", "<", Timestamp.fromDate(now))
            .limit(500);

        let loops = 0;
        const MAX_LOOPS = 20; // Safety cap: 10,000 events max per sync run

        while (loops < MAX_LOOPS) {
            const snapshot = await pastEventsQuery().get();
            if (snapshot.empty) break;

            const batch = db.batch();
            snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                batch.delete(doc.ref);
                stats.removed++;
            });
            await batch.commit();
            console.info(`Cleaned up ${snapshot.size} past events.`);
            loops++;
        }

        if (loops >= MAX_LOOPS) {
            console.warn("⚠️ Cleanup reached MAX_LOOPS. Some past events may still remain.");
        }


        // 3. Process & Write New Events
        const batch = db.batch();

        // Pre-compute IDs and References for Batch Read
        const eventIdMap = new Map<string, SerpApiEvent>();
        const documentRefs: FirebaseFirestore.DocumentReference[] = [];

        // First pass: Generate IDs and collect references
        for (const event of results) {
            // A stable link is the best unique identifier. Fallback to title + full date string.
            const idString = event.link || `${event.title}-${event.date?.when}`;
            const docId = Buffer.from(idString).toString('base64').replace(/[+/=]/g, '');
            eventIdMap.set(docId, event);
            documentRefs.push(db.collection("events").doc(docId));
        }

        // Batch Read: Fetch all snapshots in one go (N+1 fix)
        // db.getAll() is efficient for this
        const snapshots = await db.getAll(...documentRefs);
        const snapshotMap = new Map<string, FirebaseFirestore.DocumentSnapshot>();
        snapshots.forEach(snap => snapshotMap.set(snap.id, snap));

        // Second pass: Process logic using in-memory snapshots with CONCURRENCY CONTROL
        const entries = Array.from(eventIdMap.entries());
        const CONCURRENCY_LIMIT = 5; // Process 5 events in parallel to speed up image fetching

        const processEvent = async (docId: string, event: SerpApiEvent) => {
            const eventRef = db.collection("events").doc(docId);
            const docSnap = snapshotMap.get(docId); // Instant access

            // High-Res Image Logic
            // Priority: Scraped high-res (og:image) > SerpApi 'image' > SerpApi 'thumbnail'
            let imageUrl = "";

            if (event.link) {
                // Aggressively attempt to scrape the source for the best possible image
                const scrapedImage = await fetchHighResImage(event.link);
                if (scrapedImage) {
                    imageUrl = scrapedImage;
                    // console.debug(`[SYNC] Scraped high-res image for: ${event.title}`);
                }
            }

            // Fallback to SerpApi images if scraping failed or wasn't possible
            if (!imageUrl) {
                imageUrl = event.image || event.thumbnail || "";

                if (imageUrl) {
                    try {
                        // 1. Handle lh3/lh5/googleusercontent (Resizing allowed)
                        if (imageUrl.includes("googleusercontent.com") || imageUrl.includes("=w")) {
                            if (imageUrl.match(/=w\d+/)) {
                                imageUrl = imageUrl.replace(/=w\d+(-h\d+)?/, "=w1080-h1080");
                            }
                        }
                    } catch (error) {
                        console.error("Image URL normalization failed", { imageUrl, error });
                    }
                }
            }

            // Persistence Loop
            if (imageUrl) {
                const data = docSnap?.exists ? docSnap.data() : null;
                const currentThumbnail = data ? (data as { thumbnail?: string }).thumbnail : null;
                const isAlreadyPersistent =
                    typeof currentThumbnail === "string" &&
                    (currentThumbnail.includes("firebasestorage.googleapis.com") ||
                        currentThumbnail.includes("storage.googleapis.com"));

                // If user requested fresh start (forceImageResync) OR the document hasn't been persisted yet
                if (forceImageResync || !isAlreadyPersistent) {
                    const persistentUrl = await uploadImageToStorage(imageUrl, docId);
                    if (persistentUrl) {
                        imageUrl = persistentUrl;
                    }
                } else {
                    // Reuse existing persistent thumbnail if it exists
                    imageUrl = currentThumbnail || "";
                }
            }

            // Robust Date Parsing with Chrono
            let startDate: Date | null = null;
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

            // Fallback: If date is missing or invalid, default to tomorrow to ensure it passes the "past event" check
            if (!startDate) {
                startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Now + 24h
            }

            // FILTER: If event is in the past, skip/mark inactive
            // Safest: If startDate is before 'now' (minus small buffer), don't add as active.
            if (startDate < now) {
                // Debug log
                // console.debug(`Skipping past event: ${event.title} (${startDate.toISOString()})`);
                stats.skipped++;
                return;
            }

            // Debug Log
            // console.debug(`Processing: ${event.title.substring(0, 20)}... | Date: ${startDate.toISOString()} | ID: ${docId}`);

            const currentData = docSnap?.exists ? docSnap.data() as Partial<FirestoreEventDoc> : null;

            const eventData: FirestoreEventDoc = {
                title: event.title || currentData?.title || "Untitled Event",
                description: event.description ?? currentData?.description ?? "",
                link: event.link || currentData?.link || "",
                thumbnail: imageUrl || currentData?.thumbnail || "",
                address: Array.isArray(event.address)
                    ? event.address.map(String)
                    : (event.address ? [String(event.address)] : (currentData?.address ?? [])),
                venue: event.venue?.name || currentData?.venue || "",
                dateDisplay: event.date?.when || event.date?.start_date || currentData?.dateDisplay || "",
                startDate: Timestamp.fromDate(startDate),
                tags: currentData?.tags ?? ["Pune"],
                updatedAt: Timestamp.now(),
                isActive: currentData?.isActive ?? true,
                isSponsored: currentData?.isSponsored ?? false,
                isHighlighted: currentData?.isHighlighted ?? false,
                metadata: {
                    source: "serpapi",
                    originalData: event
                }
            };

            if (docSnap && docSnap.exists) {
                // Update
                batch.update(eventRef, { ...eventData });
                stats.updated++;
            } else {
                // Create
                eventData.createdAt = Timestamp.now();
                batch.set(eventRef, eventData);
                stats.added++;
            }
        };

        // Execute in Chunks
        for (let i = 0; i < entries.length; i += CONCURRENCY_LIMIT) {
            const chunk = entries.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(chunk.map(([docId, event]) => processEvent(docId, event)));
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
