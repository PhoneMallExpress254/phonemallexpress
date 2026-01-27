import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateAdminSession } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        redirect('/admin/login');
    }

    const admin = await validateAdminSession(token);

    if (!admin) {
        // Clear cookie if session is invalid (e.g., admin deleted)
        // Note: setting cookies in a layout can be tricky in some Next.js versions,
        // but redirecting to login will prompt the middleware to handle it or the user to re-auth.
        redirect('/admin/login');
    }

    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
