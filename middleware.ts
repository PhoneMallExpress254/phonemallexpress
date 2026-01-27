import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'phonemallexpress-secret-key-2026'
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin (except /admin/login) and /api/admin (except /api/admin/login)
    const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
    const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

    if (isAdminPath || isAdminApi) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            if (isAdminApi) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Basic JWT verification (signature + expiry)
            // Database verification happens in the Layout or individual API routes
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            if (isAdminApi) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
