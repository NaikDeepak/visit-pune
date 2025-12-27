"use client";

import { MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-background border-t border-border py-8 mt-auto">
            <div className="container px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 relative">
                        <img
                            src="/logo.png"
                            alt="Visit Pune Logo"
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Visit<span className="text-peshwa">Pune</span>
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
                </div>

                {/* Puneri Trademark */}
                <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
                    <span>&quot;Amchi Shakha Kuthe Hi Nahi&quot;</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-peshwa/50" />
                    <span> पुणे</span>
                </div>
            </div>
        </footer>
    );
}
