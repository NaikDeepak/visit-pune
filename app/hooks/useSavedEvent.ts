"use client";

import { useState, useEffect } from "react";

export function useSavedEvent(eventId: string) {
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const saved = localStorage.getItem("myPlans");
        if (saved) {
            const plans = JSON.parse(saved);
            setIsSaved(plans.includes(eventId));
        }
    }, [eventId]);

    const toggleSave = () => {
        const saved = localStorage.getItem("myPlans");
        let plans: string[] = saved ? JSON.parse(saved) : [];

        if (plans.includes(eventId)) {
            plans = plans.filter((id) => id !== eventId);
            setIsSaved(false);
        } else {
            plans.push(eventId);
            setIsSaved(true);
        }

        localStorage.setItem("myPlans", JSON.stringify(plans));
        // Dispatch custom event so unrelated components (Navbar) can update count
        window.dispatchEvent(new Event("storage"));
        return !isSaved; // Return new state
    };

    return { isSaved, toggleSave };
}
