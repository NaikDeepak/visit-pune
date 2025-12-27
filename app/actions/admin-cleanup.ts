"use server";

import { getAdminDb, getAdminAuth } from "@/app/lib/firebase-admin";
import { cookies } from "next/headers";
import { isAuthorizedAdmin } from "@/app/lib/admin-config";
import { Timestamp } from "firebase-admin/firestore";

interface MigrationStats {
    total: number;
    updated: number;
    errors: number;
}

/**
 * Staff-Level Migration Utility:
 * Iterates through all events and ensures they match the strict Production schema.
 * This removes the need for defensive mapping in the read path.
 */
export async function runGlobalSchemaCleanup() {
    const stats: MigrationStats = { total: 0, updated: 0, errors: 0 };

    try {
        // 1. Secure authorization
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("__session")?.value;
        if (!sessionCookie) throw new Error("Unauthorized");

        const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
        if (!isAuthorizedAdmin(decodedClaims.email)) throw new Error("Unauthorized");

        const db = getAdminDb();
        const eventsRef = db.collection("events");
        const snapshot = await eventsRef.get();

        stats.total = snapshot.size;
        console.info(`Starting migration for ${stats.total} documents...`);

        const batch = db.batch();
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            let changed = false;

            // Strict Schema Normalization logic
            const normalizedData: Record<string, unknown> = { ...data };

            // 1. Ensure address is string[]
            if (!Array.isArray(data.address)) {
                normalizedData.address = data.address ? [String(data.address)] : [];
                changed = true;
            }

            // 2. Ensure flags have defaults
            const flags = ['isActive', 'isSponsored', 'isHighlighted'];
            flags.forEach(flag => {
                if (data[flag] === undefined) {
                    normalizedData[flag] = flag === 'isActive' ? true : false;
                    changed = true;
                }
            });

            // 3. Ensure startDate is Timestamp
            if (!(data.startDate instanceof Timestamp)) {
                // If it's a date string or missing, we have a problem, but let's try to recover
                if (typeof data.startDate === 'string') {
                    normalizedData.startDate = Timestamp.fromDate(new Date(data.startDate));
                    changed = true;
                }
            }

            // 4. Ensure updatedAt exists
            if (!data.updatedAt) {
                normalizedData.updatedAt = Timestamp.now();
                changed = true;
            }

            if (changed) {
                batch.update(doc.ref, normalizedData);
                stats.updated++;
                batchCount++;
            }

            // Firestore Batch limit is 500
            if (batchCount >= 450) {
                await batch.commit();
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.info(`Migration complete. Updated ${stats.updated} docs.`);
        return { success: true, stats };

    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error: String(error), stats };
    }
}
