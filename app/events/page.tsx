"use client";

import { Navbar } from "@/app/components/ui/Navbar";
import { Calendar, MapPin } from "lucide-react";

export default function EventsPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Simple Hero */}
            <div className="pt-32 pb-12 bg-peshwa/5 px-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Upcoming Events</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From classical music at Shaniwar Wada to tech meetups in Hinjewadi.
                    </p>
                </div>
            </div>

            {/* Empty State */}
            <div className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center opacity-60">
                <div className="bg-muted p-6 rounded-full mb-6">
                    <Calendar size={48} className="text-peshwa" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Curating the Best for You</h2>
                <p className="max-w-md mx-auto">
                    We are currently gathering the latest events happening in Pune. Check back soon for a curated list of concerts, plays, and workshops.
                </p>
            </div>

        </main>
    );
}
