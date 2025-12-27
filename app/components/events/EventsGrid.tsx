"use client";

import { useState } from "react";
import { EventData } from "@/app/actions/get-events";
import { EventCard } from "./EventCard";
import { fetchEventsFromFirestore } from "@/app/actions/get-firestore-events";
import { Loader2 } from "lucide-react";

interface EventsGridProps {
    initialEvents: (EventData & { startDateVal: number })[];
    initialCursor?: string;
}

import { motion, Variants, AnimatePresence } from "framer-motion";

export function EventsGrid({ initialEvents, initialCursor }: EventsGridProps) {
    const [events, setEvents] = useState(initialEvents);
    const [cursor, setCursor] = useState<string | undefined>(initialCursor);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(!!initialCursor);

    const loadMore = async () => {
        if (loading || !cursor) return;
        setLoading(true);
        try {
            const { events: newEvents, nextCursor } = await fetchEventsFromFirestore(cursor);
            const currentIds = new Set(events.map(e => e.id));
            const uniqueNewEvents = newEvents.filter(e => !currentIds.has(e.id));

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
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {events.map((event) => (
                        <motion.div
                            layout
                            key={event.id || event.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                        >
                            <EventCard event={event} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {events.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No active events found. Check back later!</p>
                </div>
            )}

            {/* Load More Trigger */}
            {hasMore && (
                <div className="mt-12 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        {loading ? "Loading..." : "Load More Events"}
                    </motion.button>
                </div>
            )}
        </div>
    );
}
