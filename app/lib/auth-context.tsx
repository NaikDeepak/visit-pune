"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import {
    User,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Send ID token to server to create secure session cookie
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Server login failed:", error);
                await firebaseSignOut(auth);
                throw new Error(error.error || "Login failed");
            }

        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            // Call server to clear httpOnly cookie
            await fetch("/api/auth/logout", { method: "POST" });
            await firebaseSignOut(auth);

        } catch (error) {
            console.error("Sign out error:", error);
            throw error;
        }
    };

    const isAdmin = user?.email === "deep.naik@gmail.com";

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
