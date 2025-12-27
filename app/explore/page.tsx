import { getPlaces } from "@/app/actions/get-places";
import { Navbar } from "@/app/components/ui/Navbar";
import { MapPin } from "lucide-react";
import { Metadata } from "next";
import { ExploreClient } from "@/app/components/features/ExploreClient";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { vibe } = await searchParams;
    const vibeTitle = typeof vibe === 'string'
        ? vibe.charAt(0).toUpperCase() + vibe.slice(1)
        : "All Vibes";

    return {
        title: `Explore ${vibeTitle} in Pune`,
        description: `Discover the best ${vibeTitle} spots in Pune. Handpicked and curated for the perfect experience.`,
    };
}

export default async function ExplorePage({
    searchParams,
}: Props) {
    // Await the searchParams to extract the 'vibe' safely
    const resolvedSearchParams = await searchParams;
    const vibe = typeof resolvedSearchParams.vibe === 'string' ? resolvedSearchParams.vibe : undefined;

    // Fetch data (Server Side)
    const { data: places, error } = await getPlaces(vibe);

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Header with Pattern */}
            <div className="pt-32 pb-6 bg-peshwa/5 px-6 relative overflow-hidden">
                {/* Subtle Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/public/cubes.png')] mix-blend-multiply"></div>

                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                        {vibe ? `Explore: ${vibe.charAt(0).toUpperCase() + vibe.slice(1)}` : "Explore Pune"}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                        {vibe
                            ? `Curated spots for the "${vibe}" vibe.`
                            : "Discover the hidden gems and iconic landmarks of the city."}
                    </p>
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-b from-background to-secondary/20">
                {error && (
                    <div className="container mx-auto px-6 pt-8">
                        <div className="text-center p-10 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                            {error}
                        </div>
                    </div>
                )}

                {!places || places.length === 0 ? (
                    <div className="container mx-auto text-center py-24 px-6 opacity-80 max-w-md">
                        <div className="bg-muted p-6 rounded-full inline-block mb-6 animate-pulse">
                            <MapPin size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No spots found here... yet!</h3>
                        <p className="text-muted-foreground mb-8 text-lg">We couldn&apos;t find any places matching this vibe. Try exploring other categories or check back later.</p>
                        <a href="/admin/seed" className="px-8 py-3 bg-peshwa text-white rounded-full font-bold hover:bg-peshwa/90 transition-all shadow-lg hover:shadow-peshwa/30 hover:-translate-y-1 inline-block">
                            Seed Database
                        </a>
                    </div>
                ) : (
                    // Client Component handles the interactive Mesh Grid & Filtering
                    <ExploreClient initialPlaces={places} vibe={vibe} />
                )}
            </div>
        </main>
    );
}
