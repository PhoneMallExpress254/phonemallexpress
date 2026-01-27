import Link from 'next/link';
import Image from 'next/image';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Column 1: Brand & Social */}
                    <div className="footer-col brand-col">
                        <Link href="/" className="logo-footer">
                            <Image src="/logo.png" alt="Phone Mall Express" width={180} height={70} />
                        </Link>
                        <p className="footer-desc">
                            Premium phone accessories delivered with speed and quality. Elevate your mobile experience with our curated collection.
                        </p>
                        <div className="social-links">
                            <a href="https://www.facebook.com/PhonemallExpress?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                            </a>
                            <a href="https://www.instagram.com/phonemallexpress?igsh=OTB0anRzbzgybGlz&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="https://www.tiktok.com/@phonemallexpress" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Shop */}
                    <div className="footer-col">
                        <h4 className="footer-title">Shop</h4>
                        <ul className="footer-links-list">
                            <li><Link href="/products/phones">Smartphones</Link></li>
                            <li><Link href="/repairs">Repairs & Services</Link></li>
                            <li><Link href="/products/tablets">Tablets & iPads</Link></li>
                            <li><Link href="/products/audio">Audio Gear</Link></li>
                            <li><Link href="/products/gaming">Gaming</Link></li>
                            <li><Link href="/products/wearables">Wearables</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="footer-col">
                        <h4 className="footer-title">Company</h4>
                        <ul className="footer-links-list">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/bulk-quote">Bulk Purchase (RSQ)</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                            <li><Link href="/shipping">Shipping Policy</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="footer-col">
                        <h4 className="footer-title">Contact Us</h4>
                        <ul className="footer-contact-list">
                            <li className="contact-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                <div>
                                    <strong>Nairobi CBD</strong>
                                    <p>Old Mutual Building, First Floor, Suite 105</p>
                                </div>
                            </li>
                            <li className="contact-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                <div>
                                    <strong>Call / WhatsApp </strong>
                                    <a href="tel:+254718948929">+254718948929</a>
                                </div>
                            </li>
                        </ul>
                    </div>


                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Phone Mall Express. All rights reserved.</p>
                    <p style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                        Designed & Developed by <a href="https://lewisindusa.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Lewis Indusa</a>
                    </p>
                    <div className="payment-icons">
                        {/* Payment icons would go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
