import Link from 'next/link';
import MobileSearch from './MobileSearch';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <MobileSearch />
            <div className="container hero-container">
                <div className="hero-content">
                    <span className="hero-badge">Premium Accessories</span>
                    <h1 className="hero-title">
                        Elevate Your Mobile Experience
                    </h1>
                    <p className="hero-description">
                        Discover a curated collection of high-performance phone cases, lightning-fast chargers, and premium audio gear designed for the modern user.
                    </p>
                    <div className="hero-actions">
                        <Link href="/products/cases" className="btn btn-primary">
                            Shop Cases
                        </Link>
                        <Link href="/products" className="btn btn-secondary">
                            View All
                        </Link>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">5k+</span>
                            <span className="stat-label">Products</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">24h</span>
                            <span className="stat-label">Shipping</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">4.9/5</span>
                            <span className="stat-label">Rating</span>
                        </div>
                    </div>
                </div>

                <div className="hero-image-placeholder">
                    {/* We'll use generate_image later for a real hero image */}
                    <div className="glass-card">
                        <div className="product-float p1"></div>
                        <div className="product-float p2"></div>
                        <div className="product-float p3"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
