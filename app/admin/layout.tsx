import { MapPin, Database, Award, Music } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/app/components/ui/Navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebarItems = [
        { name: "Overview", href: "/admin", icon: MapPin },
        { name: "Data Seeding", href: "/admin/seed", icon: Database },
        { name: "Events Queue", href: "/admin/events", icon: Music },
        { name: "Vouchers", href: "/admin/vouchers", icon: Award },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar /> {/* Reusing main navbar for now */}

            <div className="flex flex-1 container mx-auto pt-24 px-4 gap-8">
                {/* Sidebar */}
                <aside className="w-64 hidden md:block">
                    <div className="glass rounded-2xl p-4 sticky top-24">
                        <h2 className="font-bold mb-4 px-2 text-muted-foreground uppercase text-xs tracking-wider">Admin Console</h2>
                        <nav className="space-y-1">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium transition-colors"
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0">
                    <div className="glass rounded-3xl p-8 min-h-[500px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
