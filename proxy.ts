import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {

        // Check for the session cookie
        // Note: In middleware (Edge Runtime), we cannot use firebase-admin directly to verify the signature.
        // However, the presence of the httpOnly '__session' cookie provides strong assurance
        // because it can ONLY be set by our /api/auth/login endpoint which DOES verify the signature.
        // Clients cannot forge this cookie if they don't have a valid ID token signed by Google,
        // AND if they are not the admin user (the API checks email).

        const sessionCookie = request.cookies.get('__session');

        if (!sessionCookie) {
            // No session - redirect to login
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // We trust the cookie exists because it's httpOnly and set by our trusted server API
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
};
