import Link from 'next/link';
import Image from 'next/image';
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import LazyRSQPopup from "@/components/common/LazyRSQPopup";
import './Home.css';

const CATEGORIES = [
  {
    name: 'Smartphones',
    slug: 'phones',
    image: '/phones.png',
    subcategories: ['Samsung', 'iPhone', 'Pixel', 'Nothing']
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    image: '/gaming.png',
    subcategories: ['Accessories', 'Gaming Console', 'Controllers', 'Headsets']
  },
  {
    name: 'Audio',
    slug: 'audio',
    image: '/audio.png',
    subcategories: ['Buds', 'Headphones', 'Speakers', 'Soundbar']
  },
  {
    name: 'Smartwatch',
    slug: 'wearables',
    image: '/wearables.png',
    subcategories: ['Smartwatches', 'Apple Watch', 'Galaxy Watch', 'Smart Bands']
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: '/accessories.png',
    subcategories: ['Apple Accessories', 'Samsung Accessories', 'Chargers', 'Powerbank']
  },
  {
    name: 'Storage',
    slug: 'storage',
    image: '/drive.png',
    subcategories: ['Flash Drives', 'Hard Drives', 'Memory Cards', 'USB Hubs']
  }
];

// ... (functions remain same)

// ... inside JSX ...




async function getFeaturedProducts() {
  await dbConnect();
  const featuredProducts = await Product.find({ isFeatured: true, status: 'published' })
    .limit(12)
    .lean();
  return JSON.parse(JSON.stringify(featuredProducts));
}

async function getSpecialOffers() {
  await dbConnect();
  const specialOffers = await Product.find({
    status: 'published',
    $or: [
      { isOnSpecialOffer: true },
      { compareAtPrice: { $gt: 0 } }
    ]
  })
    .limit(12)
    .sort({ discountPercentage: -1 })
    .lean();
  return JSON.parse(JSON.stringify(specialOffers));
}

async function getAppleProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    brand: { $regex: 'Apple', $options: 'i' }
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getSamsungProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    brand: { $regex: 'Samsung', $options: 'i' }
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getGamingProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    category: 'gaming'
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getFlashSales() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    isOnSpecialOffer: true
  })
    .limit(10)
    .sort({ discountPercentage: -1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getPocketFriendlyProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published'
  })
    .limit(10)
    .sort({ price: 1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  viewMoreLink: string;
}

const SectionHeader = ({ title, subtitle, viewMoreLink }: SectionHeaderProps) => (
  <div className="flex items-end justify-between" style={{ marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-sm)' }}>
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '4px' }}>{subtitle}</p>
    </div>
    <Link href={viewMoreLink} className="btn-link" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
      View More &rarr;
    </Link>
  </div>
);

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const specialOffers = await getSpecialOffers();
  const appleProducts = await getAppleProducts();
  const samsungProducts = await getSamsungProducts();
  const gamingProducts = await getGamingProducts();
  const flashSales = await getFlashSales();
  const pocketFriendly = await getPocketFriendlyProducts();

  const renderProductSection = (title: string, subtitle: string, link: string, products: any[]) => {
    if (products.length === 0) return null;
    return (
      <section className="section-py" style={{ paddingTop: '0' }}>
        <div className="container">
          <SectionHeader title={title} subtitle={subtitle} viewMoreLink={link} />
          <div className="product-grid">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="home-page">
      {/* Shop by Category Section */}
      <section className="section-py" style={{ paddingTop: '0.25rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-md)', marginTop: '1rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Premium <span className="text-accent">Accessories</span>
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', fontWeight: 500 }}>
              Shop by Category
            </p>
          </div>

          <div className="category-grid-mobi">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="mobi-card">
                <div className="mobi-card-image-wrap">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={100}
                    height={100}
                    className="mobi-card-image"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="mobi-card-content">
                  <h3 className="mobi-card-title">{cat.name}</h3>
                  <ul className="mobi-card-list">
                    {cat.subcategories.map(sub => (
                      <li key={sub}>
                        <Link href={`/search?q=${encodeURIComponent(sub)}`} className="subcategory-link">
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/products/${cat.slug}`} className="mobi-card-link">
                    Shop More &gt;&gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section (Moved Here) */}
      <section className="section-py" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Featured Products</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '4px' }}>Handpicked essentials for your mobile device.</p>
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <Link href="/products" className="btn btn-link" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View All Accessories</Link>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-xl" style={{ padding: 'var(--spacing-3xl) 0', color: 'var(--muted-foreground)' }}>
              <p>No featured products found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      {specialOffers.length > 0 && (
        <section className="section-py" style={{ paddingTop: '0', paddingBottom: '2rem' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-md)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
              <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '4px' }}>
                <span className="badge-pulse"></span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Special Offers</h2>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Limited time deals on your favorite tech.</p>
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <Link href="/search?q=deal" className="btn btn-link" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View More Special Offers</Link>
              </div>
            </div>

            <div className="product-grid">
              {specialOffers.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Apple Ecosystem */}
      {renderProductSection("The Apple Ecosystem", "Designed for iPhone, iPad, and Mac.", "/search?q=Apple", appleProducts)}

      {/* Samsung Galaxy */}
      {renderProductSection("Galaxy of Innovation", "Enhance your Samsung experience.", "/search?q=Samsung", samsungProducts)}

      {/* Gaming */}
      {renderProductSection("Level Up Your Gear", "Pro-grade peripherals for victory.", "/products/gaming", gamingProducts)}

      {/* Flash Sales */}
      {renderProductSection("Lightning Deals", "Grab them before they're gone.", "/search?q=deal", flashSales)}

      {/* Pocket Friendly */}
      {renderProductSection("Smart Savings", "Top tech that won't break the bank.", "/search?sort=price_asc", pocketFriendly)}

      {/* Partners Section */}
      <section className="section-gz" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--secondary)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Our Official Partners
            </h2>
          </div>
          <div className="partners-marquee">
            <div className="marquee-track">
              {/* Duplicated for seamless loop */}
              {[
                'Doshi Group of Companies', 'Cocacola', 'Ministry of Health', 'Ministry of Defence', 'NSSF',
                'Engie', 'FAO', 'UNHCR', 'UNOPS', 'IOM',
                'WORLD VISION', 'UNDP', 'UN-women', 'UNICEF', 'UNESCO',
                'WHO', 'ICTP', 'IAEA', 'ILO', 'UNIDO',
                'Redington', 'Cameras Africa', 'Reddot', 'Anisuma', 'Epson', 'HP',
                'Apple', 'Samsung', 'Huawei', 'Tecno', 'Infinix', 'Nothing', 'HMD', 'OPPO',
                // Duplicated for marquee
                'Doshi Group of Companies', 'Cocacola', 'Ministry of Health', 'Ministry of Defence', 'NSSF',
                'Engie', 'FAO', 'UNHCR', 'UNOPS', 'IOM',
                'WORLD VISION', 'UNDP', 'UN-women', 'UNICEF', 'UNESCO',
                'WHO', 'ICTP', 'IAEA', 'ILO', 'UNIDO',
                'Redington', 'Cameras Africa', 'Reddot', 'Anisuma', 'Epson', 'HP',
                'Apple', 'Samsung', 'Huawei', 'Tecno', 'Infinix', 'Nothing', 'HMD', 'OPPO'
              ].map((brand, i) => (
                <h3 key={i} style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--foreground)',
                  margin: 0,
                  opacity: 0.5,
                  whiteSpace: 'nowrap'
                }}>
                  {brand}
                </h3>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LazyRSQPopup />
    </div>
  );
}
