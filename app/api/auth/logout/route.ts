import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/app/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get("__session")?.value;

        if (sessionCookie) {
            // Revoke the session
            try {
                const adminAuth = getAdminAuth();
                const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
                await adminAuth.revokeRefreshTokens(decodedClaims.sub);
            } catch {
                // Ignore error if cookie is invalid, just clear it
            }
        }


        const response = NextResponse.json({ status: "success" });

        // Clear the cookie
        response.cookies.delete("__session");

        return response;

    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
