import Breadcrumbs from "@/components/common/Breadcrumbs";

const faqs = [
    {
        category: 'Shipping & Delivery',
        questions: [
            {
                q: 'How long does shipping take?',
                a: 'Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for faster delivery.'
            },
            {
                q: 'Do you ship internationally?',
                a: 'Currently, we only ship within the country. We are working on expanding our delivery reach in the near future.'
            },
            {
                q: 'How can I track my order?',
                a: 'Once your order is shipped, you will receive a tracking number via email to monitor its progress.'
            }
        ]
    },
    {
        category: 'Returns & Exchanges',
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We offer a 14-day return policy for unused products in their original packaging. Please contact support to initiate a return.'
            },
            {
                q: 'Who pays for return shipping?',
                a: 'Customers are responsible for return shipping costs unless the product arrived damaged or incorrect.'
            }
        ]
    },
    {
        category: 'Payments & Security',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, M-Pesa, and other secure online payment methods.'
            },
            {
                q: 'Is my personal information secure?',
                a: 'Yes, we use industry-standard encryption and security protocols to protect your data during every transaction.'
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-lg)' }}>
            <Breadcrumbs items={[{ label: 'FAQ', href: '/faq' }]} />

            <div className="info-page-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>Frequently Asked Questions</h1>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--muted-foreground)', maxWidth: '800px', lineHeight: 1.6 }}>
                    Find quick answers to common questions about our products and services.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)', maxWidth: '900px' }}>
                {faqs.map((cat, idx) => (
                    <section key={idx}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--accent)' }}>
                            {cat.category}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {cat.questions.map((item, i) => (
                                <div key={i} style={{ paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '4px', color: 'var(--foreground)' }}>
                                        {item.q}
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
