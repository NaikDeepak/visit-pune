"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Background Gradients using Pune Colors */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-peshwa/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-sahyadri/20 blur-[100px] rounded-full" />
            <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-mula/20 blur-[80px] rounded-full" />

            <div className="container px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 border border-border/50 text-xs font-medium mb-6 backdrop-blur-sm text-muted-foreground"
                >
                    <Sparkles size={12} className="text-peshwa" />
                    <span>AI-Powered City Concierge</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6"
                >
                    Pune: Beyond <br className="hidden md:block" />
                    the <span className="text-peshwa lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-r lg:from-peshwa lg:to-orange-600">
                        Wada
                    </span>.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Experience the Oxford of the East like never before.
                    Use AI to curate your perfect itinerary based on your vibe,
                    not just a map.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/planner"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-medium text-background transition-all duration-300 hover:bg-peshwa hover:text-white"
                    >
                        <span className="mr-2">Plan my Trip</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/explore"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/50 px-8 font-medium transition-colors hover:bg-accent hover:text-accent-foreground backdrop-blur-sm"
                    >
                        Explore Vibe
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
