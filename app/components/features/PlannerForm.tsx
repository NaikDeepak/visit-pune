"use client";

import { useState } from "react";
import { generateItinerary } from "@/app/actions/plan-trip";
import { Itinerary } from "@/app/lib/types";
import { Loader2, Send, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function PlannerForm() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Itinerary | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const res = await generateItinerary(formData);

        if (res.data) {
            setResult(res.data);
        } else {
            alert(res.error || "Something went wrong");
        }
        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
            {/* Input Section */}
            <div className="glass p-8 rounded-3xl h-fit">
                <h2 className="text-2xl font-bold mb-6">Ask the Concierge</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">What&apos;s your plan?</label>
                        <textarea
                            name="prompt"
                            rows={4}
                            placeholder="e.g. I have 4 hours, love old architecture and spicy food. I'm near Deccan."
                            className="w-full bg-background/50 border border-border rounded-xl p-4 focus:ring-2 focus:ring-peshwa outline-none transition-all placeholder:text-muted-foreground/50"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-muted-foreground">Vibe</label>
                            <select name="vibe" className="w-full bg-background/50 border border-border rounded-xl p-3 outline-none">
                                <option value="mixed">Mixed</option>
                                <option value="history">Heritage</option>
                                <option value="food">Foodie</option>
                                <option value="party">Nightlife</option>
                                <option value="chill">Relaxed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-muted-foreground">Duration</label>
                            <select name="duration" className="w-full bg-background/50 border border-border rounded-xl p-3 outline-none">
                                <option value="4 hours">Half Day (4h)</option>
                                <option value="8 hours">Full Day (8h)</option>
                                <option value="2 days">Weekend</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-peshwa text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        {loading ? "Planning..." : "Generate Itinerary"}
                    </button>
                </form>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
                {result ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-card glass p-6 rounded-2xl border border-peshwa/20">
                            <h3 className="text-2xl font-bold text-peshwa mb-1">{result.title}</h3>
                            <p className="text-muted-foreground">{result.description}</p>
                            <div className="flex gap-4 mt-4 text-sm font-medium">
                                <span className="flex items-center gap-1"><Clock size={16} /> {result.total_duration}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} /> {result.stops?.length || 0} Stops</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {result.stops?.map((stop, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-peshwa/10 text-peshwa flex items-center justify-center font-bold text-sm border border-peshwa/20 group-hover:bg-peshwa group-hover:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        {i !== result.stops.length - 1 && <div className="w-0.5 h-full bg-border my-2" />}
                                    </div>
                                    <div className="bg-card/50 p-4 rounded-2xl border border-border flex-1 hover:border-peshwa/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold">{stop.place.name}</h4>
                                            <span className="text-xs bg-accent px-2 py-1 rounded-md font-mono">{stop.time_slot}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 mb-2">{stop.activity}</p>
                                        <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg flex gap-2">
                                            <span className="font-semibold text-peshwa">Tip:</span> {stop.tips}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10 text-center opacity-50 border-2 border-dashed border-border rounded-3xl">
                        <MapPin size={48} className="mb-4" />
                        <p>Your itinerary will appear here...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
