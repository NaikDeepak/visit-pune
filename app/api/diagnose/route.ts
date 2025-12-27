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

    // Test Firestore (Complex Query - Tests Indexes)
    try {
        const db = getAdminDb();
        const { FieldPath } = require("firebase-admin/firestore");

        // Exact query from get-firestore-events.ts
        const snapshot = await db.collection("events")
            .where("isActive", "==", true)
            .orderBy("isSponsored", "desc")
            .orderBy("startDate", "asc")
            .orderBy(FieldPath.documentId(), "asc")
            .limit(1)
            .get();

        diagnostics.firestore.status = `Connected. Found ${snapshot.size} events (Index Valid).`;
    } catch (error) {
        diagnostics.firestore.status = "Failed (Likely Missing Index)";
        diagnostics.firestore.error = error instanceof Error ? error.message : String(error);
    }

    // Test Gemini (JSON Mode)
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "List 3 fruits in JSON format: { fruits: [] }",
            config: { responseMimeType: "application/json" }
        });
        diagnostics.gemini.status = `Connected. JSON Response: ${response.text?.substring(0, 50)}...`;
    } catch (error) {
        diagnostics.gemini.status = "Failed";
        diagnostics.gemini.error = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json(diagnostics, { status: 200 });
}
