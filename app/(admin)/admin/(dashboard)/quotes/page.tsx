'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Calendar, Mail, Phone, Building } from 'lucide-react';

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const res = await fetch('/api/quotes');
            const data = await res.json();
            if (data.success) {
                setQuotes(data.data);
            }
        } catch (error) {
            toast.error('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#fceda6'; // yellow-ish
            case 'In Progress': return '#a6d8fc'; // blue-ish
            case 'Completed': return '#a6fcb2'; // green-ish
            case 'Archived': return '#e0e0e0'; // gray
            default: return '#eee';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#856404';
            case 'In Progress': return '#004085';
            case 'Completed': return '#155724';
            case 'Archived': return '#666';
            default: return '#333';
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Requests...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Bulk Quote Requests</h1>
                <div style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                    Total Request: {quotes.length}
                </div>
            </div>

            {quotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ccc' }}>
                    <FileText size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No Requests Yet</h3>
                    <p style={{ color: '#666' }}>Bulk quote requests from organizations will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {quotes.map((quote) => (
                        <div key={quote._id} style={{
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Building size={18} /> {quote.organizationName}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {quote.email}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {quote.phone}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><strong>Contact:</strong> {quote.contactPerson}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        background: getStatusColor(quote.status),
                                        color: getStatusTextColor(quote.status)
                                    }}>
                                        {quote.status}
                                    </span>
                                    <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                        <Calendar size={12} />
                                        {new Date(quote.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                <strong>Requirements:</strong><br />
                                {quote.requirements}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => window.location.href = `mailto:${quote.email}?subject=Quote for ${quote.organizationName}`}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Mail size={16} /> Reply via Email
                                </button>
                                {/* Future: Add status update buttons here */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
