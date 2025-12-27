"use client";

import { useState } from "react";
import { importTripAdvisorData } from "@/app/actions/import-tripadvisor";
import { Sidebar } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/app/components/ui/Navbar";

export default function ImportPage() {
    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ success: 0, failed: 0, skipped: 0 });

    async function handleImport() {
        if (!jsonInput.trim()) return;

        setLoading(true);
        setLogs(["🚀 Starting Import Process..."]);
        setStats({ success: 0, failed: 0, skipped: 0 });

        try {
            const result = await importTripAdvisorData(jsonInput);
            setLogs(prev => [...prev, ...result.logs]);
            setStats({
                success: result.success,
                failed: result.failed,
                skipped: result.skipped
            });
            setLogs(prev => [...prev, "✨ Import Completed!"]);
        } catch (e) {
            setLogs(prev => [...prev, "❌ Critical System Error during invocation."]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Intelligence Importer</h1>
                        <p className="text-muted-foreground">Ingest raw signal data (TripAdvisor), refine with AI, and populate database.</p>
                    </div>
                    <Link href="/admin/seed" className="text-sm font-bold underline hover:text-peshwa">
                        Back to Seeder
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="space-y-4">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-bold uppercase tracking-wider mb-3">
                                Raw JSON Payload
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste SerpApi JSON here..."
                                className="w-full h-[400px] bg-secondary/30 rounded-xl p-4 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-peshwa/50 border border-transparent"
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleImport}
                                    disabled={loading || !jsonInput}
                                    className="bg-peshwa text-white px-6 py-3 rounded-xl font-bold hover:bg-peshwa/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-peshwa/25"
                                >
                                    {loading ? "Processing Intelligence..." : "Import Data"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="space-y-4">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                                <div className="text-2xl font-black text-green-600">{stats.success}</div>
                                <div className="text-[10px] font-bold uppercase text-green-600/70">Success</div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center">
                                <div className="text-2xl font-black text-yellow-600">{stats.skipped}</div>
                                <div className="text-[10px] font-bold uppercase text-yellow-600/70">Skipped</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                                <div className="text-2xl font-black text-red-600">{stats.failed}</div>
                                <div className="text-[10px] font-bold uppercase text-red-600/70">Failed</div>
                            </div>
                        </div>

                        {/* Logs Console */}
                        <div className="bg-black/90 text-green-400 font-mono text-xs p-6 rounded-2xl h-[320px] overflow-y-auto border border-white/10 shadow-inner">
                            {logs.length === 0 ? (
                                <span className="opacity-50">System ready. Waiting for input payload...</span>
                            ) : (
                                <div className="space-y-1">
                                    {logs.map((log, i) => (
                                        <div key={i} className="break-all border-b border-white/5 pb-1 mb-1 last:border-0">
                                            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
