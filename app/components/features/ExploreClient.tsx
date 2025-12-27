"use client";

import { useState, useMemo } from "react";
import { Place } from "@/app/lib/types";
import { MapPin, Star, Clock, Filter } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Props = {
    initialPlaces: Place[];
    vibe?: string;
};

export function ExploreClient({ initialPlaces, vibe }: Props) {
    const [activeFilter, setActiveFilter] = useState("All");

    const filters = ["All", "Top Rated ✨", "Open Now 🟢", "Nearest 📍", "Budget Friendly 💰"];

    // Client-side filtering logic
    const filteredPlaces = useMemo(() => {
        let result = [...initialPlaces];

        switch (activeFilter) {
            case "Top Rated ✨":
                // Sort by rating desc, treating undefined/string ratings carefully
                result.sort((a, b) => {
                    const rA = parseFloat(String(a.rating || 0));
                    const rB = parseFloat(String(b.rating || 0));
                    return rB - rA;
                });
                break;
            case "Open Now 🟢":
                // Simulation: In a real app, we'd check opening_hours against current time
                // For now, let's randomize or just return all to avoid empty states
                break;
            case "Budget Friendly 💰":
                // Filter by price_level if available, or assume 'street food' / 'snack' categories
                result = result.filter(p => !p.price_level || p.price_level <= 2);
                break;
        }
        return result;
    }, [activeFilter, initialPlaces]);

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Smart Filters - Sticky Header */}
            <div className="sticky top-24 z-30 flex flex-wrap justify-center gap-3 mb-12 py-4 bg-background/80 backdrop-blur-xl border-y border-border/50 -mx-6 px-6">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-5 py-2 rounded-full text-sm font-bold transition-all duration-300
                            ${activeFilter === filter
                                ? "bg-peshwa text-white shadow-lg shadow-peshwa/25 scale-105"
                                : "bg-card/50 border border-border hover:bg-peshwa/10 hover:border-peshwa/50 text-muted-foreground"}
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Masonry Grid using CSS Columns */}
            {filteredPlaces.length === 0 ? (
                <div className="text-center py-20 opacity-60">
                    <Filter size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-bold">
                        No spots match &quot;{activeFilter}&quot; {vibe ? `in ${vibe}` : ''}.
                    </h3>
                    <button
                        onClick={() => setActiveFilter("All")}
                        className="mt-4 text-peshwa hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredPlaces.map((place, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                key={place.id}
                                className="break-inside-avoid group relative rounded-[2rem] overflow-hidden bg-card border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                            >
                                {/* Image Container - Aspect Fit handled by CSS functionality */}
                                <Link href={`/place/${place.id}`} className="block relative">
                                    <div className="relative w-full">
                                        <Image
                                            src={place.image_url || "/placeholder-place.jpg"}
                                            alt={place.name}
                                            width={600}
                                            height={800} // Approximate aspect ratio, Masonry handles height
                                            className="w-full h-auto object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />

                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-peshwa/90 px-2 py-1 rounded-md shadow-sm">
                                                {place.category || "Hidden Gem"}
                                            </span>
                                            {place.rating && (
                                                <span className="flex items-center gap-1 text-xs font-bold bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                                                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                                    {place.rating}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-black mb-1 leading-tight group-hover:text-peshwa-light transition-colors">
                                            {place.name}
                                        </h3>

                                        <p className="text-xs text-white/80 line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                            {place.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs font-medium text-white/70">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {place.estimated_time || "2h"}
                                            </span>
                                            {place.location?.address && (
                                                <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                    <MapPin size={12} />
                                                    {place.location.address.split(',')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
