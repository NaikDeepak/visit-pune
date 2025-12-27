import { Navbar } from "@/app/components/ui/Navbar";
import { fetchEventsFromFirestore } from "@/app/actions/get-firestore-events";

// This is now a Server Component
export const revalidate = 3600; // Revalidate every hour

import { EventsGrid } from "@/app/components/events/EventsGrid";

export default async function EventsPage() {
    // Server fetch
    const { events, nextCursor } = await fetchEventsFromFirestore();

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-32 pb-12 bg-peshwa/5 px-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Upcoming Events</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From classical music at Shaniwar Wada to tech meetups in Hinjewadi.
                    </p>
                </div>
            </div>

            {/* Events Grid (Client Side with Load More) */}
            <EventsGrid initialEvents={events} initialCursor={nextCursor} />
        </main>
    );
}
