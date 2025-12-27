"use server";

import { getAdminDb } from "@/app/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function toggleEventStatus(eventId: string, field: 'isActive' | 'isSponsored' | 'isHighlighted', currentValue: boolean) {
    try {
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
        const db = getAdminDb();
        const now = new Date();
        // Fetch future events for management
        // We might want past ones too, but for cleanliness let's stick to future or recent
        const snapshot = await db.collection("events")
            //.where("startDate", ">=", new Date(now.setDate(now.getDate() - 1))) // Show recent + future
            .orderBy("startDate", "asc")
            .limit(300) // Increase limit
            .get();

        return snapshot.docs.map(doc => {
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
