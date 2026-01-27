export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', background: '#050505' }}>
            {children}
        </div>
    );
}
