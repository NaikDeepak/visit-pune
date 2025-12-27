"use server";

import { syncEventsService } from "@/app/lib/sync-service";

import { cookies } from "next/headers";
import { getAdminAuth } from "@/app/lib/firebase-admin";

import { isAuthorizedAdmin } from "@/app/lib/admin-config";

export async function triggerManualSync(forceImageResync: boolean = false) {
    try {
        // Secure server-side verification
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("__session")?.value;

        if (!sessionCookie) {
            throw new Error("Unauthorized: No session token found");
        }

        const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);

        // Strict Admin Check
        if (!isAuthorizedAdmin(decodedClaims.email)) {
            throw new Error("Unauthorized: Insufficient permissions");
        }

        // Use verified identity for logging
        const triggeredBy = `admin_${decodedClaims.email}`;

        // Call the service
        const result = await syncEventsService(triggeredBy, forceImageResync);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Manual Trigger Failed", error);
        return { success: false, error: errorMessage };
    }
}
