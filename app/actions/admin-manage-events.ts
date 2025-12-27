"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminDb, getAdminAuth } from "@/app/lib/firebase-admin";

import { isAuthorizedAdmin } from "@/app/lib/admin-config";

async function verifyAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
        throw new Error("Unauthorized: No session token found");
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);

    if (!isAuthorizedAdmin(decodedClaims.email)) {
        throw new Error("Unauthorized: Insufficient permissions");
    }
    return decodedClaims;
}

export async function toggleEventStatus(eventId: string, field: 'isActive' | 'isSponsored' | 'isHighlighted', currentValue: boolean) {
    try {
        await verifyAdmin();

        const db = getAdminDb();
        await db.collection("events").doc(eventId).update({
            [field]: !currentValue
        });

        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error(`Failed to toggle ${field}`, error);
        return { success: false, error: "Failed to update event" };
    }
}

export async function fetchAdminEvents() {
    try {
        await verifyAdmin(); // Secure read access

        const db = getAdminDb();
        // Fetch future events for management
        // We might want past ones too, but for cleanliness let's stick to future or recent
        const snapshot = await db.collection("events")
            .orderBy("startDate", "asc")
            .limit(300) // Increase limit
            .get();

        return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                link: data.link || "",
                dateDisplay: data.dateDisplay || "",
                // Convert Timestamps to standard types
                startDateVal: data.startDate?.toMillis() || 0,
                // Flags
                isActive: data.isActive ?? true,
                isSponsored: data.isSponsored ?? false,
                isHighlighted: data.isHighlighted ?? false,
                // Add any other fields if needed for Admin UI
            };
        });
    } catch (error) {
        console.error("Admin Fetch Error", error);
        return [];
    }
}
