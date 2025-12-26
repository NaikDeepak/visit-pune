"use client";

import { Navbar } from "@/app/components/ui/Navbar";
import { Users, Heart } from "lucide-react";

export default function CommunityPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Simple Hero */}
            <div className="pt-32 pb-12 bg-indigo-50 dark:bg-indigo-950/20 px-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-indigo-900 dark:text-indigo-100">Pune Community</h1>
                    <p className="text-xl text-indigo-800/60 dark:text-indigo-200/60 max-w-2xl mx-auto">
                        Connect with fellow Punekars, share stories, and grow together.
                    </p>
                </div>
            </div>

            {/* Empty State */}
            <div className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center opacity-60">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full mb-6">
                    <Users size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="max-w-md mx-auto mb-8">
                    A space for heritage walkers, foodies, and tech enthusiasts to connect.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-peshwa">
                    Made with <Heart size={16} fill="currentColor" /> in Pune
                </div>
            </div>

        </main>
    );
}
