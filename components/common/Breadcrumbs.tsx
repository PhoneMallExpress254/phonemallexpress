import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${process.env.NEXT_PUBLIC_APP_URL || ''}${item.href}`
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <ol className="breadcrumb-list">
                    <li className="breadcrumb-item">
                        <Link href="/">Home</Link>
                    </li>
                    {items.map((item, index) => (
                        <li key={item.href} className="breadcrumb-item">
                            <ChevronRight size={14} className="breadcrumb-separator" />
                            {index === items.length - 1 ? (
                                <span className="breadcrumb-current" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href}>{item.label}</Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumbs;
