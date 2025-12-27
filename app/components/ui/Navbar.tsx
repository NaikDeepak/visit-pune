"use client";

import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Explore", href: "/explore" },
        { name: "AI Concierge", href: "/planner" },
        { name: "Events", href: "/events" },
        { name: "Community", href: "/community" },
    ];

    // Determine styles based on state
    // Home + Top: Transparent, White Text
    // Home + Scrolled: Glass, Dark Text
    // Other Pages: Glass, Dark Text
    const isTransparent = isHome && !scrolled;

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "py-2" : "py-4"
        )}>
            <div className="mx-auto px-4 max-w-7xl">
                <div className={cn(
                    "rounded-full flex items-center justify-between px-6 py-3 transition-all duration-300",
                    isTransparent
                        ? "bg-transparent border-transparent"
                        : "bg-background/80 backdrop-blur-xl border border-border shadow-lg shadow-black/5"
                )}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className={cn(
                            "relative w-10 h-10 transition-transform group-hover:scale-105",
                            isTransparent ? "opacity-100" : "opacity-100"
                        )}>
                            <img
                                src="/logo.png"
                                alt="Visit Pune Logo"
                                className="object-contain w-full h-full drop-shadow-md"
                            />
                        </div>
                        <span className={cn(
                            "font-bold text-xl tracking-tight transition-colors",
                            isTransparent ? "text-white" : "text-foreground"
                        )}>
                            Visit<span className={cn(isTransparent ? "text-white/90" : "text-peshwa")}>Pune</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:scale-105 transform",
                                    isTransparent
                                        ? "text-white/90 hover:text-white"
                                        : "text-muted-foreground hover:text-peshwa"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button className={cn(
                            "px-5 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg",
                            isTransparent
                                ? "bg-white text-peshwa hover:bg-white/90"
                                : "bg-foreground text-background hover:bg-peshwa hover:text-white"
                        )}>
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "md:hidden p-1 transition-colors",
                            isTransparent ? "text-white" : "text-foreground"
                        )}
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
                        className="absolute top-20 left-4 right-4 md:hidden"
                    >
                        <div className="bg-background/90 backdrop-blur-xl rounded-3xl p-4 flex flex-col gap-2 shadow-2xl border border-border">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 hover:bg-peshwa/5 rounded-2xl text-sm font-medium transition-colors text-foreground"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-border my-2" />
                            <button className="w-full bg-peshwa text-white py-3 rounded-2xl font-semibold shadow-lg shadow-peshwa/20">
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
