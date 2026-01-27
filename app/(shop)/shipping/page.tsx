export default function ShippingPage() {
    return (
        <div className="container" style={{ padding: '3rem 0', maxWidth: '800px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Shipping Policy</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Order Processing</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                        All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email.
                        You will receive another notification when your order has shipped.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Domestic Shipping Rates and Estimates</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                        We offer flat rate shipping to various regions across the country. Shipping charges for your order will be calculated and displayed at checkout.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Nairobi CBD & Environs:</strong> Deliveries within Nairobi are typically done on the same day for orders placed before 2 PM.</li>
                        <li><strong>Upcountry:</strong> Deliveries to other major towns typically take 1-2 business days via our courier partners (e.g., G4S, Wells Fargo).</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>In-Store Pickup</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                        You can skip the shipping fees with free local pickup at our store in Nairobi CBD, Old Mutual Building, First Floor, Suite 105.
                        After placing your order and selecting local pickup at checkout, your order will be prepared and ready for pick up within 2 hours.
                        We will send you an email when your order is ready along with instructions.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>International Shipping</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                        We currently do not ship outside of the country.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>How do I check the status of my order?</h2>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                        When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status.
                        Please allow 48 hours for the tracking information to become available.
                    </p>
                </section>
            </div>
        </div>
    );
}
