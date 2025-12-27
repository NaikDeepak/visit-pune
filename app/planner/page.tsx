import { Navbar } from "@/app/components/ui/Navbar";
import { PlannerForm } from "@/app/components/features/PlannerForm";

export default function PlannerPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Premium Header */}
            <div className="pt-32 pb-12 bg-peshwa/5 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/cubes.png')] mix-blend-multiply"></div>
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-peshwa/10 text-peshwa text-xs font-bold uppercase tracking-widest border border-peshwa/20">
                        AI Powered
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Your Personal <span className="text-peshwa">Concierge</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Design your perfect Pune experience in seconds.
                        <span className="block mt-2 text-base opacity-80">Tell us your vibe, time, and mood. We&apos;ll craft the map.</span>
                    </p>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <PlannerForm mapboxToken={process.env.MAPBOX_TOKEN} />
                </div>
            </div>

        </main>
    );
}
