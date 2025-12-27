import { NextResponse } from "next/server";
import { getAdminDb } from "@/app/lib/firebase-admin";
import { ai } from "@/app/lib/gemini";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics = {
        env: {
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            FB_CLIENT_EMAIL: process.env.FB_CLIENT_EMAIL ? "Present" : "Missing",
            FB_PRIVATE_KEY: process.env.FB_PRIVATE_KEY ? `Present (Length: ${process.env.FB_PRIVATE_KEY.length})` : "Missing",
            GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "Present" : "Missing",
        },
        firestore: {
            status: "pending",
            error: null as string | null
        },
        gemini: {
            status: "pending",
            error: null as string | null
        }
    };

    // Test Firestore
    try {
        const db = getAdminDb();
        const collections = await db.listCollections();
        diagnostics.firestore.status = `Connected. Collections: ${collections.map(c => c.id).join(", ")}`;
    } catch (error) {
        diagnostics.firestore.status = "Failed";
        diagnostics.firestore.error = error instanceof Error ? error.message : String(error);
    }

    // Test Gemini
    try {
        await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "Hello",
        });
        diagnostics.gemini.status = "Connected. Response received.";
    } catch (error) {
        diagnostics.gemini.status = "Failed";
        diagnostics.gemini.error = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json(diagnostics, { status: 200 });
}
