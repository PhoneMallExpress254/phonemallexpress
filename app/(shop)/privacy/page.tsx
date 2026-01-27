import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function PrivacyPage() {
    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-lg)' }}>
            <Breadcrumbs items={[{ label: 'Privacy Policy', href: '/privacy' }]} />

            <div className="info-page-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>Privacy Policy</h1>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--muted-foreground)', maxWidth: '800px', lineHeight: 1.6 }}>
                    Your privacy is important to us. This policy outlines how we handle your personal information.
                </p>
            </div>

            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact our customer support. This may include your name, email address, shipping address, and payment information.</p>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, including to process transactions, send confirmations, and respond to your comments or questions.</p>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>3. Data Security</h2>
                    <p>We implement reasonable security measures to protect the security of your personal information, both online and offline. However, no method of transmission over the internet is 100% secure.</p>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>4. Cookies</h2>
                    <p>We use cookies to enhance your browsing experience and analyze our traffic. You can choose to disable cookies through your browser settings, but some features of our site may not function properly.</p>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@phonemallexpress.com.</p>
                </section>
            </div>
        </div>
    );
}
