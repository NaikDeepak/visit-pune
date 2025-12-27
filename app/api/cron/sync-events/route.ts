import { NextRequest, NextResponse } from "next/server";
import { syncEventsService } from "@/app/lib/sync-service";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    // Explicitly check for misconfigured secret
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return new NextResponse("Server configuration error: CRON_SECRET not set", { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { stats } = await syncEventsService("cron");
        return NextResponse.json({ success: true, stats });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal Error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
