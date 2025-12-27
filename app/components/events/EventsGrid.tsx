"use client";

import { useState } from "react";
import { EventData } from "@/app/actions/get-events";
import { EventCard } from "./EventCard";
import { fetchEventsFromFirestore } from "@/app/actions/get-firestore-events";
import { Loader2 } from "lucide-react";

interface EventsGridProps {
    initialEvents: (EventData & { startDateVal: number })[];
    initialCursor?: number;
}

export function EventsGrid({ initialEvents, initialCursor }: EventsGridProps) {
    const [events, setEvents] = useState(initialEvents);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(!!initialCursor);

    const loadMore = async () => {
        if (loading || !cursor) return;
        setLoading(true);
        try {
            const { events: newEvents, nextCursor } = await fetchEventsFromFirestore(cursor);

            // Deduplicate just in case, though startAfter usually handles it
            const currentTitles = new Set(events.map(e => e.title));
            const uniqueNewEvents = newEvents.filter(e => !currentTitles.has(e.title));

            setEvents(prev => [...prev, ...uniqueNewEvents]);
            setCursor(nextCursor);
            setHasMore(!!nextCursor && uniqueNewEvents.length > 0);
        } catch (error) {
            console.error("Failed to load more events", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event, index) => (
                    <EventCard key={`${event.title}-${index}`} event={event} />
                ))}
            </div>

            {/* Empty State */}
            {events.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No active events found. Check back later!</p>
                </div>
            )}

            {/* Load More Trigger */}
            {hasMore && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        {loading ? "Loading..." : "Load More Events"}
                    </button>
                </div>
            )}
        </div>
    );
}
