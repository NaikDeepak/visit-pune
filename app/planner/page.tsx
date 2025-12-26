import { Navbar } from "@/app/components/ui/Navbar";
import { PlannerForm } from "@/app/components/features/PlannerForm";

export default function PlannerPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-32 pb-20 container mx-auto">
                <div className="text-center mb-10 px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">AI City Concierge</h1>
                    <p className="text-lg text-muted-foreground">
                        Pune&apos;s local AI-powered travel guide. Ask me anything from &quot;best misal pav&quot; to &quot;monsoon trek spots&quot;!
                    </p>
                    <p className="text-lg text-muted-foreground">Tell us your time, vibe, and location. We&apos;ll handle the rest.</p>
                </div>
                <PlannerForm />
            </div>
        </main>
    );
}
