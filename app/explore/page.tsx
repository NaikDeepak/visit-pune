import { getPlaces } from "@/app/actions/get-places";
import { Navbar } from "@/app/components/ui/Navbar";
import { MapPin, Star, Clock } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

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

    // Fetch data
    const { data: places, error } = await getPlaces(vibe);

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Header with Pattern */}
            <div className="pt-32 pb-12 bg-peshwa/5 px-6 relative overflow-hidden">
                {/* Subtle Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>

                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                        {vibe ? `Explore: ${vibe.charAt(0).toUpperCase() + vibe.slice(1)}` : "Explore Pune"}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {vibe
                            ? `Curated spots for the "${vibe}" vibe.`
                            : "Discover the hidden gems and iconic landmarks of the city."}
                    </p>

                    {/* Filter Chips - UX Polish: Perceived Control */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {["Top Rated ✨", "Open Now 🟢", "Nearest 📍", "Budget Friendly 💰"].map((filter, i) => (
                            <button
                                key={i}
                                className="px-5 py-2 rounded-full border border-border bg-background/50 hover:bg-peshwa hover:text-white hover:border-peshwa transition-all text-sm font-semibold shadow-sm active:scale-95 backdrop-blur-sm"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-6 py-12">
                {error && (
                    <div className="text-center p-10 bg-red-500/10 text-red-500 rounded-2xl mb-8 border border-red-500/20">
                        {error}
                    </div>
                )}

                {!places || places.length === 0 ? (
                    <div className="text-center py-24 px-6 opacity-80 max-w-md mx-auto">
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {places.map((place) => (
                            <div key={place.id} className="group flex flex-col bg-card glass border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="aspect-video relative bg-accent overflow-hidden">
                                    {place.image_url ? (
                                        <Image
                                            src={place.image_url}
                                            alt={place.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <MapPin size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/10">
                                        {place.category || "general"}
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star size={12} className="text-yellow-600 fill-yellow-500" />
                                        {place.rating || "New"}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col relative">
                                    <h3 className="text-xl font-black mb-2 group-hover:text-peshwa transition-colors line-clamp-1">{place.name}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{place.description}</p>

                                    <div className="pt-4 mt-auto border-t border-dashed border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                                <Clock size={13} />
                                                {place.estimated_time || "1-2h"}
                                            </span>
                                        </div>
                                        {place.location?.address && (
                                            <span className="flex items-center gap-1.5 truncate max-w-[140px] hover:text-peshwa transition-colors cursor-help" title={place.location.address}>
                                                <MapPin size={13} />
                                                {place.location.address.split(',')[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </main>
    );
}
