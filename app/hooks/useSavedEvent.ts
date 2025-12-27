"use client";

import { useSyncExternalStore, useMemo } from "react";

const MY_PLANS_EVENT = "myPlans:changed";

function subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => { };

    window.addEventListener("storage", callback);
    window.addEventListener(MY_PLANS_EVENT, callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(MY_PLANS_EVENT, callback);
    };
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

        // Dispatch a StorageEvent so other tabs update
        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "myPlans",
                oldValue: saved,
                newValue,
                storageArea: localStorage,
                url: window.location.href,
            }),
        );

        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event(MY_PLANS_EVENT));
        return nextIsSaved;
    };

    return { isSaved, toggleSave };
}
