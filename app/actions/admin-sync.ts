"use server";

import { syncEventsService } from "@/app/lib/sync-service";

export async function triggerManualSync(userId: string) {
    try {
        // Basic authorization check - mostly relying on Middleware/Layout protection
        // But helpful to log WHO triggered it
        const triggeredBy = `user_${userId}`; // In real app, verify admin claim here

        // Call the service
        const result = await syncEventsService(triggeredBy);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Manual Trigger Failed", error);
        return { success: false, error: errorMessage };
    }
}
