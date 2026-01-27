import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function AboutPage() {
    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-lg)' }}>
            <Breadcrumbs items={[{ label: 'About Us', href: '/about' }]} />

            <div className="info-page-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>
                    About <span style={{ color: '#E30613' }}>Phone</span><span style={{ color: '#0054A6' }}>Mall</span><span style={{ color: '#0054A6' }}>Express</span><span style={{ color: '#0054A6' }}>™</span>
                </h1>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--muted-foreground)', maxWidth: '800px', lineHeight: 1.6 }}>
                    Redefining the mobile experience with premium accessories and unparalleled service since 2018.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>Our Story</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: 'var(--spacing-sm)' }}>
                        At <span style={{ fontWeight: 700 }}><span style={{ color: '#E30613' }}>Phone</span><span style={{ color: '#0054A6' }}>Mall</span><span style={{ color: '#0054A6' }}>Express</span><span style={{ color: '#0054A6' }}>™</span></span>, we believe that your mobile device is more than just a tool—it's an extension of your lifestyle. Founded with a passion for technology and design, we've grown into a leading destination for premium mobile accessories.
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
                        We started small, driven by the frustration of finding high-quality accessories that didn't compromise on style or protection. Today, we curate a selection of the world's best cases, chargers, and audio gear, ensuring every product we sell meets our rigorous standards for performance and aesthetics.
                    </p>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>Quality First</h3>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>We only stock products from trusted brands and manufacturers, ensuring durability and reliability.</p>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>Fast Shipping</h3>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>Your time is valuable. We optimize our logistics to deliver your essentials in record time.</p>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>Expert Support</h3>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>Our team of tech enthusiasts is always ready to help you find the perfect match for your device.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
