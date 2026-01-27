'use client';

import dynamic from 'next/dynamic';

const RSQPopup = dynamic(() => import('./RSQPopup'), { ssr: false });

export default function LazyRSQPopup() {
    return <RSQPopup />;
}
