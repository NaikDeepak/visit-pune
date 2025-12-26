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
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-32 pb-20 container mx-auto px-4">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Pune</h1>
                    <p className="text-lg text-muted-foreground">
                        {vibe
                            ? `Curated spots for the "${vibe}" vibe.`
                            : "Discover the hidden gems and iconic landmarks of the city."}
                    </p>
                </header>

                {error && (
                    <div className="text-center p-10 bg-red-500/10 text-red-500 rounded-2xl">
                        {error}
                    </div>
                )}

                {!places || places.length === 0 ? (
                    <div className="text-center p-20 opacity-50">
                        <MapPin size={48} className="mx-auto mb-4" />
                        <p>No places found. Try seeding the database in Admin!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {places.map((place) => (
                            <div key={place.id} className="group bg-card glass border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-peshwa/50">
                                <div className="aspect-video relative bg-accent">
                                    {place.image_url ? (
                                        <Image
                                            src={place.image_url}
                                            alt={place.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <MapPin size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider">
                                        {place.category || "general"}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        {place.rating || "New"}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-peshwa transition-colors line-clamp-1">{place.name}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{place.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-foreground/70">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {place.estimated_time || "1-2 hrs"}
                                        </span>
                                        {place.location?.address && (
                                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                <MapPin size={14} />
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
