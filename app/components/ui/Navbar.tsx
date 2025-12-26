"use client";

import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Explore", href: "/explore" },
        { name: "AI Concierge", href: "/planner" },
        { name: "Events", href: "/events" },
        { name: "Community", href: "/community" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto px-6 py-4">
                <div className="glass rounded-2xl flex items-center justify-between px-6 py-3 shadow-lg shadow-black/5">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-peshwa text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                            <MapPin size={20} fill="currentColor" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">
                            Visit<span className="text-peshwa">Pune</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-peshwa transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-peshwa hover:text-white transition-colors">
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-foreground p-1"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-20 left-6 right-6 md:hidden"
                    >
                        <div className="glass rounded-2xl p-4 flex flex-col gap-2 shadow-2xl">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 hover:bg-accent rounded-xl text-sm font-medium transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-border my-2" />
                            <button className="w-full bg-peshwa text-white py-3 rounded-xl font-semibold">
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
