"use client";

import { useState } from "react";
import { backfillCategories } from "@/app/actions/migrate-categories";
import { Loader2, Database, CheckCircle, AlertTriangle, RefreshCcw } from "lucide-react";

export default function MigratePage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        success: boolean;
        updated: number;
        skipped: number;
        failed: number;
        errors: string[];
    } | null>(null);

    async function handleMigrate() {
        if (!confirm("This will update all places without categories. Continue?")) {
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const migrationResults = await backfillCategories();
            setResults(migrationResults);
        } catch (error: any) {
            setResults({
                success: false,
                updated: 0,
                skipped: 0,
                failed: 1,
                errors: [error.message]
            });
        }

        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <RefreshCcw className="text-peshwa" />
                Category Migration
            </h1>

            <div className="bg-accent/30 p-6 rounded-2xl mb-8">
                <h2 className="text-lg font-semibold mb-3">About This Migration</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    This script will backfill the <code className="bg-black/20 px-1 py-0.5 rounded">category</code> field
                    for all places in Firestore that either:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc mb-4">
                    <li>Don't have a category field</li>
                    <li>Have category set to "general"</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-6">
                    The script uses <strong>AI classification</strong> based on place names to determine
                    the correct category (history, food, nature, nightlife, etc.)
                </p>

                <button
                    onClick={handleMigrate}
                    disabled={loading}
                    className="bg-peshwa text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-peshwa/90 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Running Migration...
                        </>
                    ) : (
                        <>
                            <RefreshCcw size={20} />
                            Start Migration
                        </>
                    )}
                </button>
            </div>

            {results && (
                <div className="bg-accent/30 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        {results.success ? (
                            <CheckCircle className="text-green-500" size={24} />
                        ) : (
                            <AlertTriangle className="text-yellow-500" size={24} />
                        )}
                        <h2 className="text-lg font-semibold">
                            Migration {results.success ? "Complete" : "Completed with Errors"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">{results.updated}</div>
                            <div className="text-xs text-muted-foreground">Updated</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">{results.skipped}</div>
                            <div className="text-xs text-muted-foreground">Skipped</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-500">{results.failed}</div>
                            <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                    </div>

                    {results.errors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-red-500 mb-2">Errors:</h3>
                            <div className="text-xs font-mono text-red-400 space-y-1 max-h-40 overflow-y-auto">
                                {results.errors.map((error, i) => (
                                    <div key={i}>{error}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
