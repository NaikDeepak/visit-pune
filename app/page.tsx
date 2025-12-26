import { Navbar } from "@/app/components/ui/Navbar";
import { Hero } from "@/app/components/features/Hero";
import { VibeGrid } from "@/app/components/features/VibeGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-peshwa/20">
      <Navbar />
      <Hero />
      <VibeGrid />

      {/* Footer Placeholder */}
      <footer className="py-10 text-center text-sm text-muted-foreground border-t border-border mt-20">
        <p>© 2025 VisitPune.in. Built with ❤️ in Pune.</p>
      </footer>
    </main>
  );
}
