import "server-only";

// Define allowed admins here. 
// In a real production env, this might come from a database role or an environment variable list.
// For now, we allow overrides via env vars but default to the known admin.
export const ADMIN_EMAILS = [
    "deep.naik@gmail.com",
    process.env.ADMIN_EMAIL, // Optional additional admin from env
].filter(Boolean) as string[];

export function isAuthorizedAdmin(email?: string): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}

export const ADMIN_CONFIG = {
    emails: ADMIN_EMAILS,
};
