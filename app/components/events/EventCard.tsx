import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Bookmark, Check } from "lucide-react";
import { EventData } from "@/app/actions/get-events";
import { useSavedEvent } from "@/app/hooks/useSavedEvent";

interface EventCardProps {
    event: EventData;
}

export function EventCard({ event }: EventCardProps) {
    const { isSaved, toggleSave } = useSavedEvent(event.id || "");

    // Use event.thumbnail or a placeholder if missing
    // Also block insecure HTTP images to prevent mixed content warnings
    let imageUrl = event.thumbnail || "";
    if (imageUrl.startsWith("http://")) {
        imageUrl = ""; // Force fallback
    }

    if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";
    }

    // Format date logic
    const dateDisplay = event.date.when || event.date.start_date;

    return (
        <div className="group relative flex flex-col bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

            {/* Save Button (Absolute Top Right for quick access) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleSave();
                }}
                className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${isSaved
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/90 text-neutral-600 hover:bg-white hover:text-purple-600"
                    }`}
                title={isSaved ? "Saved to My Plans" : "Save to My Plans"}
            >
                {isSaved ? <Check size={18} strokeWidth={3} /> : <Bookmark size={18} />}
            </button>

            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
                    <Calendar size={12} className="text-primary" />
                    {event.date.start_date || "Upcoming"}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    <Link href={event.link || "#"} target="_blank" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {event.title}
                    </Link>
                </h3>

                {/* Meta Info */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <Calendar size={14} className="mt-1 shrink-0" />
                        <span>{dateDisplay}</span>
                    </div>
                    {event.venue?.name && (
                        <div className="flex items-start gap-2">
                            <MapPin size={14} className="mt-1 shrink-0" />
                            <span className="line-clamp-1">{event.venue.name}</span>
                        </div>
                    )}
                </div>

                {/* Description (Optional) */}
                {event.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4 flex-1">
                        {event.description}
                    </p>
                )}

                {/* Footer / CTA */}
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        {isSaved ? "Saved to My Plans" : "More Details"}
                    </span>
                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </div>
        </div>
    );
}
