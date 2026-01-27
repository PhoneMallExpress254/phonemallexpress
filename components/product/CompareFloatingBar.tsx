"use client";

import { X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/context/CompareContext';
import './CompareFloatingBar.css';

export default function CompareFloatingBar() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <div className="compare-bar">
            <div className="container compare-bar-inner">
                <div className="compare-items">
                    {compareList.map((product) => (
                        <div key={product._id} className="compare-item-preview">
                            <div className="compare-thumb">
                                <Image
                                    src={product.images?.[0]?.url || product.imageUrl || '/placeholder.png'}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    style={{ objectFit: 'cover' }}
                                />
                                <button
                                    className="remove-compare-item"
                                    onClick={() => removeFromCompare(product._id)}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {compareList.length < 3 && (
                        <div className="compare-placeholder">
                            <span>Add {3 - compareList.length} more</span>
                        </div>
                    )}
                </div>

                <div className="compare-actions">
                    <button onClick={clearCompare} className="clear-compare-btn">
                        Clear All
                    </button>
                    <Link href="/compare" className="compare-now-btn">
                        Compare Now ({compareList.length})
                    </Link>
                </div>
            </div>
        </div>
    );
}
