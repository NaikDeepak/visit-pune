"use client";

import { useSyncExternalStore, useMemo } from "react";

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("myPlans");
}

function getServerSnapshot() {
    return null;
}

export function useSavedEvent(eventId: string) {
    const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const isSaved = useMemo(() => {
        if (!saved) return false;
        try {
            const plans = JSON.parse(saved);
            return Array.isArray(plans) && plans.includes(eventId);
        } catch {
            return false;
        }
    }, [saved, eventId]);

    const toggleSave = () => {
        if (!eventId) return false;

        const saved = localStorage.getItem("myPlans");
        let plans: string[] = [];

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    plans = parsed;
                }
            } catch {
                // If data is corrupted, clear it and start fresh
                localStorage.removeItem("myPlans");
            }
        }

        const nextIsSaved = !plans.includes(eventId);

        if (!nextIsSaved) {
            plans = plans.filter((id) => id !== eventId);
        } else {
            plans.push(eventId);
        }

        const newValue = JSON.stringify(plans);
        localStorage.setItem("myPlans", newValue);

        // Dispatch a StorageEvent so unrelated components (Navbar) can update count
        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "myPlans",
                oldValue: saved,
                newValue,
                storageArea: localStorage,
                url: window.location.href,
            }),
        );
        return nextIsSaved;
    };

    return { isSaved, toggleSave };
}
