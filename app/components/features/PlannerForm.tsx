"use client";

import { useState, useRef, useEffect } from "react";
import { generateItinerary } from "@/app/actions/plan-trip";
import { Itinerary } from "@/app/lib/types";
import { Loader2, Send, MapPin, Clock, AlignLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { ItineraryMap } from "./ItineraryMap";

interface PlannerFormProps {
    mapboxToken?: string;
}

export function PlannerForm(props: PlannerFormProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Itinerary | null>(null);
    const [selectedVibe, setSelectedVibe] = useState("mixed");
    const [selectedDuration, setSelectedDuration] = useState("4 hours");
    const [statusMessage, setStatusMessage] = useState("Thinking...");
    const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);

    const loadingMessages = [
        "Consulting with the Peshwas... 🏰",
        "Finding the spiciest Misal... 🌶️",
        "Checking traffic on JM Road... 🚦",
        "Curating hidden wadas... 🗝️",
        "Brewing the perfect chai... ☕"
    ];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setSelectedStopIndex(null);

        // Cycle through status messages
        let msgIdx = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStatusMessage(loadingMessages[msgIdx % loadingMessages.length]);
            msgIdx++;
        }, 1500);

        const formData = new FormData(e.currentTarget);
        formData.set("vibe", selectedVibe);
        formData.set("duration", selectedDuration);

        try {
            const res = await generateItinerary(formData);
            if (res.data) {
                setResult(res.data);
            } else {
                alert(res.error || "Something went wrong");
            }
        } finally {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setLoading(false);
        }
    }

    const vibes = [
        { id: "mixed", label: "Surprise Me", icon: "✨" },
        { id: "history", label: "Heritage", icon: "🏰" },
        { id: "food", label: "Foodie", icon: "🍛" },
        { id: "party", label: "Nightlife", icon: "🍸" },
        { id: "chill", label: "Relaxed", icon: "🍃" }
    ];

    const durations = [
        { id: "4 hours", label: "Half Day (4h)" },
        { id: "8 hours", label: "Full Day (8h)" },
        { id: "2 days", label: "Weekend" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
            {/* Input Section - Full Width */}
            <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-peshwa to-orange-500"></div>

                <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3 text-foreground">
                    <Sparkles className="text-peshwa animate-pulse" />
                    Start Planning
                </h2>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Col: Textarea */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="p-1 bg-secondary rounded-md"><AlignLeft size={14} /></span>
                            What&apos;s on your mind?
                        </label>
                        <textarea
                            name="prompt"
                            rows={6}
                            placeholder="e.g. I want to see Shaniwar Wada, eat authentic Misal, and find a quiet place to read in the evening."
                            className="w-full h-[180px] bg-background/50 border-2 border-transparent focus:border-peshwa/50 focus:bg-background rounded-3xl p-6 text-lg md:text-xl resize-none transition-all placeholder:text-muted-foreground/40 outline-none shadow-inner"
                            required
                        />
                    </div>

                    {/* Right Col: Filters & Action */}
                    <div className="flex flex-col justify-between gap-6">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Choose Vibe</label>
                                <div className="flex flex-wrap gap-2">
                                    {vibes.map(v => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedVibe(v.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2
                                                ${selectedVibe === v.id
                                                    ? "bg-peshwa text-white border-peshwa shadow-lg shadow-peshwa/20 scale-105"
                                                    : "bg-background/40 hover:bg-background border-border text-foreground/70 hover:scale-105"}`}
                                        >
                                            <span>{v.icon}</span> {v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {durations.map(d => (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setSelectedDuration(d.id)}
                                            className={`py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center
                                                ${selectedDuration === d.id
                                                    ? "bg-foreground text-background border-foreground shadow-lg"
                                                    : "bg-background/40 hover:bg-background border-border text-foreground/70"}`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-peshwa to-orange-600 text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-peshwa/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Itinerary</span>
                                    <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Result Section */}
            <div id="results" className="relative min-h-[600px] scroll-mt-24">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 glass rounded-[2.5rem] animate-pulse border border-peshwa/20">
                        <div className="w-24 h-24 bg-peshwa/10 rounded-full flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 border-4 border-peshwa/20 rounded-full animate-ping"></div>
                            <Loader2 size={48} className="text-peshwa animate-spin" />
                        </div>
                        <h3 className="text-3xl font-black text-peshwa mb-4">{statusMessage}</h3>
                        <p className="text-lg text-muted-foreground">Designing your custom Pune experience...</p>
                    </div>
                ) : result ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 h-full flex flex-col"
                    >
                        {/* Summary Card */}
                        <div className="bg-card glass p-8 rounded-[2.5rem] border border-peshwa/20 shadow-xl relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 right-0 p-24 bg-peshwa/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
                            <h3 className="text-3xl md:text-4xl font-black text-foreground mb-3 relative z-10">{result.title}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed relative z-10 max-w-4xl">{result.description}</p>
                            <div className="flex flex-wrap gap-4 mt-6">
                                <span className="px-4 py-2 bg-secondary/50 rounded-xl text-sm font-bold flex items-center gap-2 border border-border">
                                    <Clock size={16} className="text-peshwa" /> {result.total_duration}
                                </span>
                                <span className="px-4 py-2 bg-secondary/50 rounded-xl text-sm font-bold flex items-center gap-2 border border-border">
                                    <MapPin size={16} className="text-peshwa" /> {result.stops?.length || 0} Stops
                                </span>
                            </div>
                        </div>

                        {/* Split View: List + Map */}
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 min-h-[600px] lg:h-[700px]">
                            {/* Scrollable Timeline */}
                            <div className="bg-card/30 glass rounded-[2.5rem] p-6 lg:p-8 overflow-y-auto theme-scrollbar border border-border/50 relative">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 sticky top-0 bg-card/95 backdrop-blur-md p-2 z-20 rounded-lg">Your Timeline</h4>
                                <div className="space-y-8 relative pl-4 lg:pl-6 before:absolute before:left-[19px] before:top-12 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-peshwa before:via-peshwa/50 before:to-transparent">
                                    {result.stops?.map((stop, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`relative group cursor-pointer transition-all ${selectedStopIndex === i ? "scale-[1.01]" : "hover:scale-[1.01]"}`}
                                            onClick={() => setSelectedStopIndex(i)}
                                        >
                                            {/* Timeline Dot */}
                                            <div className={`
                                                absolute -left-[12px] lg:-left-[20px] top-6 w-8 h-8 rounded-full border-4 z-10 shadow-sm transition-all duration-300
                                                ${selectedStopIndex === i ? "bg-peshwa border-peshwa scale-110 shadow-peshwa/40" : "bg-background border-peshwa group-hover:bg-peshwa"}
                                            `}>
                                                <span className={`
                                                    flex items-center justify-center h-full w-full text-[10px] font-black
                                                    ${selectedStopIndex === i ? "text-white" : "text-peshwa group-hover:text-white"}
                                                `}>
                                                    {i + 1}
                                                </span>
                                            </div>

                                            <div className={`
                                                p-5 rounded-3xl border transition-all shadow-sm
                                                ${selectedStopIndex === i
                                                    ? "bg-peshwa/5 border-peshwa shadow-lg ring-1 ring-peshwa/20"
                                                    : "bg-card border-border/50 hover:border-peshwa/30 hover:shadow-md"}
                                            `}>
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-lg md:text-xl text-foreground">{stop.place.name}</h4>
                                                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-lg border border-border whitespace-nowrap">
                                                        {stop.time_slot}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{stop.activity}</p>

                                                {stop.tips && (
                                                    <div className="text-xs bg-yellow-500/5 text-yellow-700 dark:text-yellow-400 p-3 rounded-2xl border border-yellow-500/10 flex gap-3 items-start">
                                                        <span className="text-base select-none">💡</span>
                                                        <span className="italic leading-snug">{stop.tips}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Map Container */}
                            <div className="h-[400px] lg:h-full rounded-[2.5rem] overflow-hidden border border-border shadow-2xl sticky lg:top-6">
                                <ItineraryMap
                                    stops={result.stops || []}
                                    selectedStopIndex={selectedStopIndex}
                                    onMarkerClick={setSelectedStopIndex}
                                    mapboxToken={props.mapboxToken}
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-card/20">
                        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MapPin size={40} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-muted-foreground mb-2">Your Map Awaits</h3>
                        <p className="text-muted-foreground/60 max-w-xs mx-auto">Fill in your preferences above to generate a custom map and interactive timeline.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
