import "server-only";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// You should store these secrets in environment variables in production
// For development/mocking purposes, we might need a dummy service account or proper env vars
function getFirebaseAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return getApp();
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    // Only initialize if we have credentials, otherwise throw or mock in dev
    if (!privateKey) {
        throw new Error("Missing FIREBASE_PRIVATE_KEY. Cannot initialize Firebase Admin.");
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    };

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

// Export lazy getters to avoid build-time initialization errors
export const getAdminAuth = () => {
    const app = getFirebaseAdminApp();
    return getAuth(app);
}

export const getAdminDb = () => {
    const app = getFirebaseAdminApp();
    return getFirestore(app);
}
