"use client";

import { motion } from "framer-motion";
import { Coffee, Landmark, Mountain, Music, Moon, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

const vibes = [
    {
        id: "history",
        title: "Heritage Walks",
        icon: Landmark,
        desc: "Shaniwar Wada to Agashechi Wadi.",
        color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        colSpan: "md:col-span-2",
    },
    {
        id: "food",
        title: "Misal & More",
        icon: Coffee,
        desc: "Spicy adventures.",
        color: "bg-peshwa/10 text-peshwa",
        colSpan: "md:col-span-1",
    },
    {
        id: "nature",
        title: "Sahyadri Escapes",
        icon: Mountain,
        desc: "Trek the forts.",
        color: "bg-sahyadri/10 text-sahyadri",
        colSpan: "md:col-span-1",
    },
    {
        id: "nightlife",
        title: "KP Nights",
        icon: Moon,
        desc: "Craft beers & high spirits.",
        color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
        colSpan: "md:col-span-2",
    },
    {
        id: "culture",
        title: "Art & Culture",
        icon: Music,
        desc: "Theatre to Sawyer.",
        color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
        colSpan: "md:col-span-1",
    },
    {
        id: "books",
        title: "Oxford East",
        icon: BookOpen,
        desc: "Book cafes & libraries.",
        color: "bg-mula/10 text-mula",
        colSpan: "md:col-span-1",
    },
];

export function VibeGrid() {
    return (
        <section className="container px-6 py-20">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">What's your vibe today?</h2>
                <p className="text-muted-foreground">Select a category to get AI-curated suggestions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]">
                {vibes.map((vibe, i) => (
                    <motion.div
                        key={vibe.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl p-6 transition-all hover:shadow-lg cursor-pointer border border-border bg-card",
                            vibe.colSpan
                        )}
                    >
                        <div className={cn("absolute top-0 right-0 p-32 rounded-full opacity-10 blur-3xl transition-all group-hover:scale-110", vibe.color.split(" ")[0])} />

                        <Link href={`/explore?vibe=${vibe.id}`} className="absolute inset-0 z-20" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors", vibe.color)}>
                                <vibe.icon size={24} />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-peshwa transition-colors">{vibe.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{vibe.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
