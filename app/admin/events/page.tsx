"use client";

import { useState, useEffect } from "react";
import { fetchSyncLogs } from "@/app/actions/get-logs";
import { triggerManualSync } from "@/app/actions/admin-sync";
import { fetchAdminEvents, toggleEventStatus } from "@/app/actions/admin-manage-events";
import { Loader2, RefreshCw, CheckCircle, XCircle, Eye, EyeOff, Star, DollarSign } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";

interface SyncLog {
    id: string;
    status: 'success' | 'failure';
    triggeredBy: string;
    timestamp: string | number | Date; // Firestore timestamp or serialized date
    stats?: {
        added: number;
        updated: number;
        removed: number;
        skipped: number;
    };
    error?: string;
}

// Reuse EventData or similar, but with our flags
interface AdminEvent {
    id: string;
    title: string;
    dateDisplay: string;
    isActive: boolean;
    isSponsored: boolean;
    isHighlighted: boolean;
    startDateVal: number;
    link: string;
}

export default function AdminEventsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'logs' | 'events'>('events'); // Default to events management

    // Logs State
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(true);

    // Events State
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [forceImageResync, setForceImageResync] = useState(false);

    // Initial Load
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const { logs: fetchedLogs } = await fetchSyncLogs();
                if (mounted) setLogs(fetchedLogs as SyncLog[]);
            } finally {
                if (mounted) setLoadingLogs(false);
            }
        };

        load();

        // Also load events
        refreshEvents();

        return () => { mounted = false; };
    }, []);

    const refreshEvents = async () => {
        setLoadingEvents(true);
        try {
            const data = await fetchAdminEvents();
            setEvents(data as unknown as AdminEvent[]);
        } catch (e) { console.error(e); }
        finally { setLoadingEvents(false); }
    };

    // Manual Refresh Logs
    const refreshLogs = async () => {
        setLoadingLogs(true);
        try {
            const { logs: fetchedLogs } = await fetchSyncLogs();
            setLogs(fetchedLogs as SyncLog[]);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleSync = async () => {
        if (!user) return;
        setSyncing(true);
        try {
            await triggerManualSync(forceImageResync);
            setTimeout(() => {
                refreshLogs();
                refreshEvents(); // Also refresh events as sync adds new ones
                setSyncing(false);
            }, 3000); // Give it a bit more time for valid sync
        } catch (error) {
            console.error("Sync trigger failed", error);
            setSyncing(false);
        }
    };

    const handleToggle = async (id: string, field: 'isActive' | 'isSponsored' | 'isHighlighted', current: boolean) => {
        // Optimistic update
        const previousEvents = [...events];
        setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: !current } : e));

        try {
            const result = await toggleEventStatus(id, field, current);
            if (!result.success) {
                // Revert on server failure
                setEvents(previousEvents);
                console.error("Toggle failed on server:", result.error);
            }
        } catch (error) {
            // Revert on network/unexpected error
            setEvents(previousEvents);
            console.error("Toggle failed:", error);
        }
    };

    if (!user) {
        return <div className="p-8 text-center">Please log in to access Admin Dashboard.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-2">Event Operations</h1>
                    <p className="text-muted-foreground">Manage crawls, visibility, and monetization.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'events' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                        Manage Events
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'logs' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                        Sync Logs
                    </button>
                </div>
            </div>

            {/* Sync Control (Always Visible) */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex-1">
                    <h3 className="font-bold text-lg">Google Events Sync</h3>
                    <p className="text-sm text-muted-foreground mb-4 md:mb-0">Fetch latest ~100 events and persist high-quality images to Storage.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                    <label className="flex items-center gap-3 cursor-pointer group whitespace-nowrap bg-muted/30 px-4 py-2 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                        <input
                            type="checkbox"
                            checked={forceImageResync}
                            onChange={(e) => setForceImageResync(e.target.checked)}
                            className="w-5 h-5 text-primary border-border rounded focus:ring-primary/20 transition-all"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold group-hover:text-primary transition-colors">Force Image Refresh</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">High-Res Priority</span>
                        </div>
                    </label>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} className="font-bold" />}
                        {syncing ? "Syncing..." : "Run Sync Job"}
                    </button>
                </div>
            </div>

            {activeTab === 'events' && (
                <div className="space-y-4">
                    {loadingEvents ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-center">Visibility</th>
                                            <th className="px-6 py-4 text-center">Sponsored</th>
                                            <th className="px-6 py-4 text-center">Highlight</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {events.map((event) => (
                                            <tr key={event.id} className="hover:bg-muted/5 transition-colors group">
                                                <td className="px-6 py-4 font-medium max-w-xs truncate" title={event.title}>
                                                    {event.title}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                    {event.dateDisplay}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggle(event.id, 'isActive', event.isActive)}
                                                        className={`p-2 rounded-full transition-colors ${event.isActive ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : 'text-muted-foreground bg-muted hover:bg-muted/80'}`}
                                                        title={event.isActive ? "Visible" : "Hidden"}
                                                    >
                                                        {event.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggle(event.id, 'isSponsored', event.isSponsored)}
                                                        className={`p-2 rounded-full transition-colors ${event.isSponsored ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' : 'text-muted-foreground hover:bg-muted'}`}
                                                        title="Toggle Sponsored"
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggle(event.id, 'isHighlighted', event.isHighlighted)}
                                                        className={`p-2 rounded-full transition-colors ${event.isHighlighted ? 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/20' : 'text-muted-foreground hover:bg-muted'}`}
                                                        title="Toggle Highlight"
                                                    >
                                                        <Star size={16} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={event.link} target="_blank" className="text-primary hover:underline text-xs">
                                                        View Source
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-border text-xs text-center text-muted-foreground">
                                Showing {events.length} events (Fetches ~200 most recent/future)
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-4">
                    {loadingLogs ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} /></div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Triggered By</th>
                                        <th className="px-6 py-4 text-right">Stats (Added/Upd/Rem)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.status === 'success' ? (
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-500" />
                                                    )}
                                                    <span className="font-medium capitalize">{log.status}</span>
                                                </div>
                                                {log.error && <p className="text-xs text-red-500 mt-1">{log.error}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {typeof log.timestamp === 'string' ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                                                {log.triggeredBy.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs">
                                                {log.stats ? (
                                                    <span className="flex items-center justify-end gap-3">
                                                        <span className="text-green-600">+{log.stats.added}</span>
                                                        <span className="text-blue-600">~{log.stats.updated}</span>
                                                        <span className="text-red-600">-{log.stats.removed}</span>
                                                    </span>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
