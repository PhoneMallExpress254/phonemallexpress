"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Building2, Send } from 'lucide-react';

export default function BulkQuotePage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        requirements: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            toast.success('Quote request submitted successfully!');
            setFormData({
                organizationName: '',
                contactPerson: '',
                email: '',
                phone: '',
                requirements: ''
            });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-md) 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--secondary)',
                        color: 'var(--accent)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <Building2 size={32} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>
                        Bulk Purchase Requests
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Need to equip your office or organization? Get a competitive custom quote for bulk orders of phones, computers, and accessories.
                    </p>
                </div>

                <div style={{
                    background: 'var(--secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Organization Name</label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Contact Person</label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                    placeholder="07XX XXX XXX"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Requirement Details</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                required
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="Please list the items and quantities you're looking for, or any specific requirements..."
                            ></textarea>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '6px' }}>
                                We will prepare a custom quote and get back to you within 24 hours.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 'var(--spacing-lg)',
                                width: '100%',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--foreground)',
                                color: 'var(--background)',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Submitting...' : (
                                <>
                                    Submit Request <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
