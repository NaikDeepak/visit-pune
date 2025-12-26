"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Shaniwar Wada at Golden Hour"
                    fill
                    priority
                    className="object-cover"
                    quality={100}
                />
                {/* Cinematic Overlay - Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background/90" />
            </div>

            <div className="container px-6 relative z-10 flex flex-col items-center text-center pt-20">



                {/* Main Typography */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-2xl"
                >
                    Experience <br className="md:hidden" />
                    {/* Fixed Contrast: Increased opacity and added better text shadow */}
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        Pune
                    </span>
                </motion.h1>
                {/* Puneri Badge - "Jithe nahi kahi Une" */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full shadow-lg"
                >
                    <span className="text-sm md:text-base font-medium text-white tracking-widest uppercase drop-shadow-md">
                        Pune, Jithe nahi kahi Une
                    </span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-2xl text-white/90 max-w-2xl font-light mb-12 drop-shadow-lg"
                >
                    Beyond the Wada. Discover the hidden gems of the Oxford of the East.
                </motion.p>

                {/* Simplified Glassmorphism Search Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-2xl"
                >
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tell AI: 'Find me the best Misal spots...'"
                            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-5 pl-8 pr-20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all shadow-2xl text-lg"
                        />
                        <Link
                            href="/planner"
                            className="absolute right-2 top-2 bottom-2 bg-peshwa hover:bg-peshwa/90 text-white px-6 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-peshwa/30 font-bold"
                        >
                            Go
                        </Link>
                    </div>

                    {/* Smart Suggestion Chips - IDEO Principle: Guide the user */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-4 flex flex-wrap justify-center gap-2"
                    >
                        <span className="text-white/60 text-sm font-medium mr-2">Try asking:</span>
                        {[
                            "Best Misal pav near me 🌶️",
                            "Monsoon treks 🌧️",
                            "Historical Wadas 🏰",
                            "Live Music & Bars 🎸"
                        ].map((chip, index) => (
                            <button
                                key={index}
                                className="text-xs md:text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm transition-all hover:scale-105 hover:text-white"
                                onClick={(e) => {
                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    if (input) input.value = chip.replace(/ .*/, '...'); // Simple simulation
                                }}
                            >
                                {chip}
                            </button>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Popular Tags */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/80"
                >
                    <span>Popular:</span>
                    {["Heritage Walks", "Craft Beer", "Trekking", "Street Food"].map((tag) => (
                        <Link
                            key={tag}
                            href={`/explore?q=${tag}`}
                            className="hover:text-white underline decoration-white/30 hover:decoration-white transition-all"
                        >
                            {tag}
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
