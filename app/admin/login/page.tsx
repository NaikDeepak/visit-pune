"use client";

import { useAuth } from "@/app/lib/auth-context";
import { LogIn, Loader2, ShieldAlert } from "lucide-react";

export default function SignInPage() {
    const { signInWithGoogle, loading, user, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-peshwa" size={48} />
            </div>
        );
    }

    if (user && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-accent/30 p-8 rounded-2xl border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <ShieldAlert size={32} />
                        <h1 className="text-2xl font-bold">Access Denied</h1>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        You are signed in as <strong>{user.email}</strong>, but you don't have admin privileges.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Only <code className="bg-black/20 px-1 py-0.5 rounded">deep.naik@gmail.com</code> can access the admin portal.
                    </p>
                </div>
            </div>
        );
    }

    if (user && isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-accent/30 p-8 rounded-2xl border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4 text-green-500">
                        <ShieldAlert size={32} />
                        <h1 className="text-2xl font-bold">Authenticated</h1>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        You are signed in as <strong>{user.email}</strong>.
                    </p>
                    <a
                        href="/admin/seed"
                        className="block w-full bg-peshwa text-white px-6 py-3 rounded-lg font-bold text-center hover:bg-peshwa/90 transition-colors"
                    >
                        Go to Admin Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-peshwa/5 via-background to-blue-500/5">
            <div className="max-w-md w-full bg-accent/30 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-peshwa to-blue-500 bg-clip-text text-transparent">
                        Admin Portal
                    </h1>
                    <p className="text-muted-foreground">
                        Visit Pune · Data Management
                    </p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full bg-white text-gray-800 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </>
                    )}
                </button>

                <p className="text-xs text-muted-foreground text-center mt-6">
                    Only authorized administrators can access this portal.
                </p>
            </div>
        </div>
    );
}
