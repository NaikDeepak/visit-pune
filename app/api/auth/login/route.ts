import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/app/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        // Create session cookie (valid for 5 days)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Verify the ID token first to ensure it's valid and from our expected user
        const adminAuth = getAdminAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Authorization Check: Hardcoded admin email for now
        if (decodedToken.email !== "deep.naik@gmail.com") {
            return NextResponse.json({ error: "Unauthorized email" }, { status: 401 });
        }

        // Create the session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // Set the cookie
        const response = NextResponse.json({ status: "success" });
        response.cookies.set("__session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        return response;

    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
