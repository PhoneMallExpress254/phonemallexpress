"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, ChevronRight, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import './Navbar.css';
import { ThemeToggle } from '../ui/ThemeToggle';

const categories = [
    {
        name: 'Smartphones',
        slug: 'phones',
        subItems: [
            { name: 'Apple iPhone', slug: 'phones?brand=apple' },
            { name: 'Samsung Phones', slug: 'phones?brand=samsung' },
            { name: 'Nothing Phone', slug: 'phones?brand=nothing' },
            { name: 'Google Pixel Phones', slug: 'phones?brand=pixel' },
            { name: 'Xiaomi Phones', slug: 'phones?brand=xiaomi' },
            { name: 'Infinix Phones', slug: 'phones?brand=infinix' },
            { name: 'Tecno Phones', slug: 'phones?brand=tecno' },
            { name: 'Oppo Phones', slug: 'phones?brand=oppo' },
            { name: 'Realme Phones', slug: 'phones?brand=realme' },
            { name: 'Vivo Phones', slug: 'phones?brand=vivo' },
            { name: 'Honor Phones', slug: 'phones?brand=honor' },
            { name: 'Huawei Phones', slug: 'phones?brand=huawei' },
            { name: 'Itel Phones', slug: 'phones?brand=itel' },
            { name: 'Nokia Phones', slug: 'phones?brand=nokia' },
            { name: 'Poco Phones', slug: 'phones?brand=poco' },
            { name: 'HMD Phones', slug: 'phones?brand=hmd' },
            { name: 'Motorola Phones', slug: 'phones?brand=motorola' },
            { name: 'OnePlus Phones', slug: 'phones?brand=oneplus' },
        ]
    },
    {
        name: 'Tablets & iPads',
        slug: 'tablets',
        subItems: [
            { name: 'Apple iPad', slug: 'tablets?brand=apple' },
            { name: 'Samsung Tablets', slug: 'tablets?brand=samsung' },
            { name: 'Tecno Tablets', slug: 'tablets?brand=tecno' },
            { name: 'Redmi Tablets', slug: 'tablets?brand=redmi' },
            { name: 'Xiaomi Tablets', slug: 'tablets?brand=xiaomi' },
        ]
    },
    {
        name: 'Audio',
        slug: 'audio',
        subItems: [
            { name: 'Buds', slug: 'audio?type=buds' },
            { name: 'Earphones', slug: 'audio?type=earphones' },
            { name: 'Headphones', slug: 'audio?type=headphones' },
            { name: 'Soundbar', slug: 'audio?type=soundbar' },
            { name: 'Speakers', slug: 'audio?type=speakers' },
        ]
    },
    {
        name: 'Gaming',
        slug: 'gaming',
        subItems: [
            { name: 'Gaming Consoles', slug: 'gaming?type=console' },
            { name: 'PlayStation Games', slug: 'gaming?type=games' },
            { name: 'Gaming Controller', slug: 'gaming?type=controller' },
            { name: 'Gaming Headsets', slug: 'gaming?type=headset' },
        ]
    },
    {
        name: 'Wearables',
        slug: 'wearables',
        subItems: [
            { name: 'Smartwatch', slug: 'wearables?type=smartwatch' },
            { name: 'Smart Bands', slug: 'wearables?type=smartband' },
            { name: 'Smart Ring', slug: 'wearables?type=ring' },
        ]
    },
    {
        name: 'Mobile Accessories',
        slug: 'accessories',
        subItems: [
            { name: 'Samsung Accessories', slug: 'accessories?brand=samsung' },
            { name: 'Apple Accessories', slug: 'accessories?brand=apple' },
            { name: 'Chargers & Adapters', slug: 'accessories?type=chargers' },
            { name: 'Powerbanks', slug: 'accessories?type=powerbanks' },
            { name: 'Cables', slug: 'accessories?type=cables' },
            { name: 'Screen Protectors', slug: 'accessories?type=protectors' },
            { name: 'Phone Covers', slug: 'accessories?type=covers' },
            { name: 'Media Streamers', slug: 'accessories?type=streamers' },
            { name: 'Flash Drives', slug: 'accessories?type=flashdrives' },
            { name: 'Handheld Gimbals', slug: 'accessories?type=gimbals' },
            { name: 'Hard Disks', slug: 'accessories?type=harddisks' },
            { name: 'Memory Cards', slug: 'accessories?type=memorycards' },
            { name: 'Modems', slug: 'accessories?type=modems' },
            { name: 'Mouse', slug: 'accessories?type=mouse' },
        ]
    },
    {
        name: 'Computing',
        slug: 'computing',
        subItems: [
            { name: 'Laptops', slug: 'laptops' },
            { name: 'Desktops', slug: 'computing?type=desktop' },
            { name: 'Monitors', slug: 'computing?type=monitor' },
            { name: 'Printers', slug: 'computing?type=printer' },
        ]
    },
    {
        name: 'TVs',
        slug: 'tvs',
        subItems: [
            { name: 'Smart TVs', slug: 'tvs?type=smart' },
            { name: 'Android TVs', slug: 'tvs?type=android' },
            { name: '4K UHD TVs', slug: 'tvs?type=4k' },
            { name: 'TV Accessories', slug: 'tvs?type=accessories' },
        ]
    },
    {
        name: 'Refrigerators',
        slug: 'appliances/fridges',
        subItems: [
            { name: 'Side by Side', slug: 'appliances?type=side-by-side' },
            { name: 'Single Door', slug: 'appliances?type=single-door' },
            { name: 'Double Door', slug: 'appliances?type=double-door' },
        ]
    },
    {
        name: 'Washing Machines',
        slug: 'appliances/washing',
        subItems: [
            { name: 'Top Load', slug: 'appliances?type=top-load' },
            { name: 'Front Load', slug: 'appliances?type=front-load' },
        ]
    },
    {
        name: 'Kitchen Ware',
        slug: 'kitchen',
        subItems: [
            { name: 'Cookers', slug: 'kitchen?type=cookers' },
            { name: 'Airfryers', slug: 'kitchen?type=airfryers' },
            { name: 'Blenders', slug: 'kitchen?type=blenders' },
            { name: 'Electric Kettles', slug: 'kitchen?type=kettles' },
        ]
    },
    {
        name: 'Cameras',
        slug: 'cameras',
        subItems: [
            { name: 'Digital Cameras', slug: 'cameras?type=digital' },
            { name: 'Security Cameras', slug: 'cameras?type=security' },
            { name: 'Camera Accessories', slug: 'cameras?type=accessories' },
        ]
    }
];

const Navbar = () => {
    const { totalItems } = useCart();
    const { wishlist } = useWishlist();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'categories' | 'menu'>('categories');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
        }
    };

    const toggleCategory = (slug: string) => {
        setExpandedCategory(expandedCategory === slug ? null : slug);
    };

    return (
        <>
            <header className="navbar">
                <div className="container navbar-container">
                    {/* LEFT: Menu Toggle (Mobile) */}
                    <div className="navbar-left">
                        <button
                            className="icon-btn menu-toggle"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="desktop-menu-wrapper">
                            <div className="dropdown-wrapper">
                                <button className="menu-dropdown-btn">
                                    <Menu size={20} />
                                    <span>Menu</span>
                                </button>

                                <div className="dropdown-menu-content">
                                    <Link href="/products" className="menu-item-link">All Accessories</Link>

                                    {categories.map((cat) => (
                                        <div key={cat.slug} className="menu-item-with-sub">
                                            <Link href={`/products/${cat.slug}`} className="menu-item-link">
                                                {cat.name}
                                                <ChevronRight size={14} />
                                            </Link>

                                            <div className="sub-menu-content">
                                                {cat.subItems.map((sub, idx) => (
                                                    <Link
                                                        key={idx}
                                                        href={`/products/${sub.slug}`}
                                                        className="sub-item-link"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <hr className="menu-divider" />
                                    <Link href="/repairs" className="menu-item-link">Repairs & Services</Link>
                                    <Link href="/about" className="menu-item-link">About Us</Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/" className="logo desktop-only">
                            <Image src="/logo.png" alt="Phone Mall Express" width={180} height={50} className="logo-image" style={{ width: 'auto', height: '50px' }} priority />
                        </Link>
                    </div>

                    {/* CENTER: Logo (Mobile) or Search (Desktop) */}
                    <div className="navbar-center">
                        <Link href="/" className="logo mobile-only">
                            <Image src="/logo.png" alt="Phone Mall Express" width={140} height={40} className="logo-image" style={{ width: 'auto', height: '40px' }} priority />
                        </Link>

                        <form onSubmit={handleSearch} className="search-form desktop-only">
                            <input
                                type="text"
                                placeholder="Search accessories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="search-submit-btn">
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="navbar-right">
                        <Link href="/wishlist" className="action-btn-with-label" aria-label="Wishlist">
                            <div className="cart-icon-wrapper">
                                <Heart size={22} />
                                {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
                            </div>
                            <span className="action-label desktop-only">Saved</span>
                        </Link>

                        <Link href="/account" className="action-btn-with-label desktop-only" aria-label="Account">
                            <User size={22} />
                            <span className="action-label">Account</span>
                        </Link>

                        <div>
                            <ThemeToggle />
                        </div>

                        <Link href="/checkout" className="action-btn-with-label" aria-label="Cart">
                            <div className="cart-icon-wrapper">
                                <ShoppingCart size={22} />
                                <span className="badge">{totalItems}</span>
                            </div>
                            <span className="action-label desktop-only">Cart</span>
                        </Link>
                    </div>
                </div>

                {/* SUB NAVBAR (Desktop) */}
                <div className="sub-navbar desktop-only">
                    <div className="container sub-navbar-container">
                        {[
                            { name: 'Samsung', href: '/search?q=Samsung' },
                            { name: 'Apple', href: '/search?q=Apple' },
                            { name: 'Smartphones', href: '/products/phones' },
                            { name: 'Mobile Accessories', href: '/products/accessories' },
                            { name: 'Audio', href: '/products/audio' },
                            { name: 'Gaming', href: '/products/gaming' },
                            { name: 'Storage', href: '/products?type=storage' },
                            { name: 'Tablets', href: '/products/tablets' },
                            { name: 'Content Creator Kit', href: '/search?q=Content+Creator' }
                        ].map((link) => {
                            const isActive = () => {
                                const [path, query] = link.href.split('?');
                                if (pathname !== path) return false;
                                if (query) {
                                    const params = new URLSearchParams(query);
                                    for (const [key, val] of params.entries()) {
                                        if (searchParams.get(key) !== val) return false;
                                    }
                                }
                                return true;
                            };

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`sub-nav-link ${isActive() ? 'text-accent' : ''}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            <aside className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-top-actions">
                        <Link href="/" className="drawer-logo" onClick={() => setIsMobileMenuOpen(false)}>
                            <Image src="/logo.png" alt="Phone Mall Express" width={140} height={36} className="logo-image" style={{ width: 'auto', height: '36px' }} />
                        </Link>
                        <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="drawer-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            CATEGORIES
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                            onClick={() => setActiveTab('menu')}
                        >
                            MENU
                        </button>
                    </div>
                </div>

                <div className="drawer-content">
                    {activeTab === 'categories' ? (
                        <nav className="mobile-nav-list">
                            {categories.map((cat) => (
                                <div key={cat.slug} className="mobile-nav-item">
                                    <div className="mobile-nav-row">
                                        <Link
                                            href={`/products/${cat.slug}`}
                                            className="mobile-nav-link"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                        <button
                                            className={`mobile-accordion-btn ${expandedCategory === cat.slug ? 'expanded' : ''}`}
                                            onClick={() => toggleCategory(cat.slug)}
                                        >
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>

                                    {expandedCategory === cat.slug && (
                                        <div className="mobile-submenu">
                                            {cat.subItems.map((sub, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/products/${sub.slug}`}
                                                    className="mobile-submenu-link"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    ) : (
                        <nav className="mobile-nav-list">
                            <Link href="/" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/products" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                All Accessories
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/checkout" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                Checkout
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/wishlist" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                Wishlist
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/account" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                My Account
                                <ChevronRight size={18} />
                            </Link>
                            <hr className="drawer-divider" />
                            <Link href="/about" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                About Us
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/contact" className="mobile-nav-link-item" onClick={() => setIsMobileMenuOpen(false)}>
                                Contact Us
                                <ChevronRight size={18} />
                            </Link>
                        </nav>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Navbar;
