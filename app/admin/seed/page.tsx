"use client";

import { useState } from "react";
import { fetchPlacesFromSerpApi } from "@/app/actions/seed-places";
import { db } from "@/app/lib/firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { Loader2, Database, CheckCircle, AlertTriangle } from "lucide-react";
import { Place } from "@/app/lib/types";

export default function SeederPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [query, setQuery] = useState("Top tourist places in Pune");

    async function handleSeed() {
        setLoading(true);
        setLogs(prev => ["Starting fetch from SerpApi...", ...prev]);

        try {
            const res = await fetchPlacesFromSerpApi(query);

            if (res.error) {
                setLogs(prev => [`Error: ${res.error}`, ...prev]);
                setLoading(false);
                return;
            }

            const places = res.data;
            setLogs(prev => [`Fetched ${places.length} places. Writing to Firestore...`, ...prev]);

            let count = 0;
            for (const p of places) {
                // Transform to our Schema
                // Create a URL-friendly ID from name if place_id is ugly, but place_id is reliable.
                // We will use place_id as document key to avoid duplicates.

                const placeData: Place = {
                    id: p.id, // Google Place ID
                    name: p.name,
                    description: p.description,
                    location: {
                        lat: p.location.lat,
                        lng: p.location.lng,
                        address: p.location.address
                    },
                    image_url: p.image_url,
                    estimated_time: "2 hours" // Default
                };

                // Write to Firestore "places" collection
                await setDoc(doc(db, "places", p.id), placeData, { merge: true });

                count++;
                // Small delay to not rate limit Firestore (optional)
            }

            setLogs(prev => [`Success! Written ${count} documents.`, ...prev]);

        } catch (e: any) {
            setLogs(prev => [`Critical Error: ${e.message}`, ...prev]);
        }
        setLoading(false);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="text-peshwa" />
                Data Seeding
            </h1>

            <div className="bg-accent/30 p-6 rounded-2xl mb-8">
                <label className="block text-sm font-medium mb-2">Search Query (Google Maps Engine)</label>
                <div className="flex gap-4">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-background border border-border px-4 py-2 rounded-lg"
                    />
                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className="bg-peshwa text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Start Seeding"}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Fetches 20 results via SerpApi (uses 1 credit). Writes to `places` collection.
                </p>

                <div className="mt-6">
                    <p className="text-sm font-medium mb-3 text-muted-foreground">Quick Seed (Click to populate):</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Historical places in Pune",
                            "Best Misal Pav in Pune",
                            "Popular trekking spots near Pune",
                            "Best pubs and breweries in Koregaon Park",
                            "Museums and Art Galleries in Pune",
                            "Famous Ganpati Temples in Pune"
                        ].map((q) => (
                            <button
                                key={q}
                                onClick={() => setQuery(q)}
                                className="text-xs border border-peshwa/20 bg-peshwa/5 hover:bg-peshwa/10 text-peshwa px-3 py-1.5 rounded-full transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-black/90 text-green-400 font-mono text-sm p-4 rounded-xl h-64 overflow-y-auto">
                {logs.length === 0 && <span className="text-gray-500">// Logs will appear here...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-white/10 pb-1">
                        {log.includes("Error") ? <span className="text-red-400">{log}</span> : log}
                    </div>
                ))}
            </div>
        </div>
    );
}
