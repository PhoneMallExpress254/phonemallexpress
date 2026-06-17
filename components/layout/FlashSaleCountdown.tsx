"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import './FlashSaleCountdown.css';

interface FlashSaleCountdownProps {
    count?: number;
}

function getRemaining() {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end.getTime() - now.getTime());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { hours, minutes, seconds };
}

const pad = (n: number) => n.toString().padStart(2, '0');

const FlashSaleCountdown = ({ count }: FlashSaleCountdownProps) => {
    const [time, setTime] = useState(getRemaining());

    useEffect(() => {
        const timer = setInterval(() => setTime(getRemaining()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flash-countdown">
            <div className="container flash-countdown-inner">
                <div className="flash-countdown-label">
                    <Zap size={18} className="flash-countdown-icon" />
                    <span>
                        Flash Sale{count ? ` \u2014 ${count} deals` : ''} ends in
                    </span>
                </div>
                <div className="flash-countdown-timer" aria-live="polite">
                    <span className="flash-countdown-unit">{pad(time.hours)}</span>
                    <span className="flash-countdown-sep">:</span>
                    <span className="flash-countdown-unit">{pad(time.minutes)}</span>
                    <span className="flash-countdown-sep">:</span>
                    <span className="flash-countdown-unit">{pad(time.seconds)}</span>
                </div>
                <Link href="/search?q=deal" className="flash-countdown-cta">
                    Shop Now &rarr;
                </Link>
            </div>
        </div>
    );
};

export default FlashSaleCountdown;
