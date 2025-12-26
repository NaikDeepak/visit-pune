"use client";

import { useAuth } from "@/app/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, User } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Redirect to login if not authenticated (except on login page)
        if (!loading && !user && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-peshwa" size={48} />
            </div>
        );
    }

    // Show login page route without layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Require authentication for all other admin routes
    if (!user) {
        return null; // Will redirect via useEffect
    }

    // Check admin privileges
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 p-8 rounded-2xl">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You don&apos;t have permission to access the admin portal.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Navigation Bar */}
            <nav className="bg-accent/30 backdrop-blur-xl border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold text-peshwa">
                                Visit Pune Admin
                            </Link>
                            <div className="hidden md:flex gap-4">
                                <a
                                    href="/admin/seed"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/admin/seed"
                                        ? "bg-peshwa/10 text-peshwa"
                                        : "hover:bg-accent/50"
                                        }`}
                                >
                                    Seeding
                                </a>
                                <a
                                    href="/admin/migrate"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/admin/migrate"
                                        ? "bg-peshwa/10 text-peshwa"
                                        : "hover:bg-accent/50"
                                        }`}
                                >
                                    Migration
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <User size={16} className="text-muted-foreground" />
                                <span className="hidden md:inline text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await signOut();
                                    } finally {
                                        router.push("/admin/login");
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} />
                                <span className="hidden md:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
