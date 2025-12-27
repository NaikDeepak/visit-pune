"use client";

import { useState, useEffect } from "react";

export function useSavedEvent(eventId: string) {
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Sync with localStorage on mount (Client-side only)
        const saved = localStorage.getItem("myPlans");
        if (saved) {
            try {
                const plans = JSON.parse(saved);
                if (Array.isArray(plans) && plans.includes(eventId)) {
                    setIsSaved(true);
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [eventId]);

    const toggleSave = () => {
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

        if (plans.includes(eventId)) {
            plans = plans.filter((id) => id !== eventId);
            setIsSaved(false);
        } else {
            plans.push(eventId);
            setIsSaved(true);
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
        return !isSaved; // Return new state
    };

    return { isSaved, toggleSave };
}
