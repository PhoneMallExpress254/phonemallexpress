'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
    images: { url: string; alt: string }[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    const handleImageError = () => {
        setImageErrors(prev => ({ ...prev, [activeIndex]: true }));
    };

    // Fallback if no images
    if (!images || images.length === 0) {
        return (
            <div className="main-image-container">
                <div className="product-image-placeholder" />
            </div>
        );
    }

    return (
        <div className="product-media">
            <div className="main-image-container">
                {!imageErrors[activeIndex] && images[activeIndex]?.url ? (
                    <Image
                        src={images[activeIndex]?.url}
                        alt={images[activeIndex]?.alt || name}
                        fill
                        priority
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="main-image"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="product-image-placeholder" />
                )}
            </div>

            {images.length > 1 && (
                <div className="image-thumbnails">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={`thumbnail-container ${activeIndex === i ? 'active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                        >
                            {!imageErrors[i] && img.url ? (
                                <Image
                                    src={img.url}
                                    alt={img.alt || `${name} thumbnail ${i + 1}`}
                                    fill
                                    unoptimized
                                    sizes="60px"
                                    onError={() => setImageErrors(prev => ({ ...prev, [i]: true }))}
                                />
                            ) : (
                                <div className="product-image-placeholder" style={{ opacity: 0.5 }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
