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
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setIsSaved(true);
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [eventId]);

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

        setIsSaved(nextIsSaved);

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
