import { Truck, ShieldCheck, CreditCard, Headset } from 'lucide-react';
import './TrustStrip.css';

const TRUST_ITEMS = [
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'Nairobi CBD & nationwide shipping'
    },
    {
        icon: ShieldCheck,
        title: 'Genuine Products',
        description: '100% authentic, warranty-backed'
    },
    {
        icon: CreditCard,
        title: 'Secure Payment',
        description: 'M-Pesa, Card & Bank transfer'
    },
    {
        icon: Headset,
        title: 'Dedicated Support',
        description: 'Fast WhatsApp & call assistance'
    }
];

const TrustStrip = () => {
    return (
        <section className="trust-strip">
            <div className="container">
                <div className="trust-strip-grid">
                    {TRUST_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="trust-item">
                                <div className="trust-item-icon">
                                    <Icon size={22} />
                                </div>
                                <div className="trust-item-text">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TrustStrip;
