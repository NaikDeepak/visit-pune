"use server";

import { getAdminDb } from "@/app/lib/firebase-admin";

export async function fetchSyncLogs() {
    try {
        const db = getAdminDb();
        const snapshot = await db.collection("sync_logs")
            .orderBy("timestamp", "desc")
            .limit(20)
            .get();

        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate().toISOString() // Serialize for client
        }));

        return { logs };
    } catch (error) {
        console.error("Error fetching logs:", error);
        return { logs: [], error: "Failed to fetch logs" };
    }
}
