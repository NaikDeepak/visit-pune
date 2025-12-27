"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/app/lib/utils";

const vibes = [
    {
        id: "history",
        title: "Heritage",
        desc: "Walk through the Peshwa legacy",
        image: "/vibes/history.png",
        colSpan: "md:col-span-2",
        rowSpan: "md:row-span-2",
    },
    {
        id: "food",
        title: "Misal Trails",
        desc: "Spicy adventures await",
        image: "/vibes/food.png",
        colSpan: "md:col-span-1",
        rowSpan: "md:row-span-1",
    },
    {
        id: "nature",
        title: "Sahyadri",
        desc: "Monsoon treks & forts",
        image: "/vibes/nature.png",
        colSpan: "md:col-span-1",
        rowSpan: "md:row-span-2",
    },
    {
        id: "nightlife",
        title: "KP Nights",
        desc: "Craft beers & high spirits",
        image: "/vibes/nightlife.png",
        colSpan: "md:col-span-1",
        rowSpan: "md:row-span-1",
    },
    {
        id: "culture",
        title: "Culture Check",
        desc: "Theatre, Music & Arts",
        image: "/vibes/culture.png",
        colSpan: "md:col-span-1",
        rowSpan: "md:row-span-1",
    },
    {
        id: "books",
        title: "Oxford East",
        desc: "ABC & Book Cafes",
        image: "/vibes/books.png",
        colSpan: "md:col-span-3",
        rowSpan: "md:row-span-1",
    },
];

export function VibeGrid() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 40, damping: 15 }
        }
    } as const;

    return (
        <section className="container px-6 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6"
            >
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Find your <span className="text-peshwa">Vibe</span></h2>
                    <p className="text-xl text-muted-foreground">Curated experiences for every mood.</p>
                </div>
                <Link href="/explore" className="group flex items-center gap-2 font-medium hover:text-peshwa transition-colors">
                    View all categories <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]"
            >
                {vibes.map((vibe) => (
                    <motion.div
                        key={vibe.id}
                        variants={item}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl cursor-pointer bg-muted",
                            vibe.colSpan,
                            vibe.rowSpan
                        )}
                    >
                        <Link href={`/explore?vibe=${vibe.id}`} className="block h-full w-full">
                            {/* Background Image with Zoom Effect */}
                            <Image
                                src={vibe.image}
                                alt={vibe.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-peshwa-light transition-colors">{vibe.title}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 transform translate-y-2 group-hover:translate-y-0">
                                        {vibe.desc}
                                    </p>
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                                        <ArrowUpRight className="text-white" size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
