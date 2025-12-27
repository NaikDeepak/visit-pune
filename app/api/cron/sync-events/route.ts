import { NextRequest, NextResponse } from "next/server";
import { syncEventsService } from "@/app/lib/sync-service";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
