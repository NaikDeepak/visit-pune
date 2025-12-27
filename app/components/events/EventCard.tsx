
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Bookmark, Check } from "lucide-react";
import { EventData } from "@/app/actions/get-events";
import { useSavedEvent } from "@/app/hooks/useSavedEvent";
import { motion } from "framer-motion";

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
        <motion.div
            whileHover={{
                y: -10,
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="group relative flex flex-col bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
        >

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                    e.preventDefault();
                    toggleSave();
                }}
                className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-colors duration-300 ${isSaved
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/40"
                    : "bg-white/90 text-neutral-500 hover:bg-white hover:text-purple-600"
                    }`}
                title={isSaved ? "Saved to My Plans" : "Save to My Plans"}
            >
                {isSaved ? <Check size={18} strokeWidth={3} /> : <Bookmark size={18} />}
            </motion.button>

            {/* Image Container */}
            <div className="relative h-52 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <motion.div
                    className="relative w-full h-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized={true}
                    />
                </motion.div>

                {/* Gradient Overlay - Subtle & Premium */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 z-[1]" />

                {/* Date Badge - Glassmorphism */}
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                    <Calendar size={12} className="text-purple-300" />
                    {event.date.start_date || "Upcoming"}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 relative">
                <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    <Link href={event.link || "#"} target="_blank" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {event.title}
                    </Link>
                </h3>

                {/* Meta Info */}
                <div className="space-y-2 mb-5 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0 text-purple-500/70" />
                        <span>{dateDisplay}</span>
                    </div>
                    {event.venue?.name && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-purple-500/70" />
                            <span className="line-clamp-1">{event.venue.name}</span>
                        </div>
                    )}
                </div>

                {/* Description (Optional) */}
                {event.description && (
                    <p className="text-sm text-neutral-500/80 dark:text-neutral-500 line-clamp-2 mb-4 flex-1 font-sans">
                        {event.description}
                    </p>
                )}

                {/* Footer / CTA */}
                <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-600/80 dark:text-purple-400/80 tracking-wide uppercase">
                        {isSaved ? "Saved" : "Details"}
                    </span>
                    <motion.div
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <ExternalLink size={16} className="text-neutral-400 group-hover:text-purple-600 transition-colors" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
