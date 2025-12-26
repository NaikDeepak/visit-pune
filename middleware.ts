import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_EMAIL = 'deep.naik@gmail.com';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {

        // Get the session cookie (Firebase Auth sets this)
        const sessionCookie = request.cookies.get('__session');

        if (!sessionCookie) {
            // No session - redirect to login
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // In a production app, you would verify the token server-side here
            // using Firebase Admin SDK. For now, we'll rely on Firestore rules
            // and add a basic cookie check.

            // The client-side will set a cookie with the user email after auth
            const userEmail = request.cookies.get('admin_email')?.value;

            if (userEmail !== ADMIN_EMAIL) {
                const loginUrl = new URL('/admin/login', request.url);
                loginUrl.searchParams.set('error', 'unauthorized');
                return NextResponse.redirect(loginUrl);
            }

            // Allow the request to proceed
            return NextResponse.next();

        } catch (error) {
            console.error('Auth middleware error:', error);
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('error', 'auth_failed');
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
};
