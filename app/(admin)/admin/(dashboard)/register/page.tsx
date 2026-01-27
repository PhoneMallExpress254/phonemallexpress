'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './register.module.css';

export default function RegisterAdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<{
        success?: boolean;
        message?: string;
        error?: string;
    }>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({});

        try {
            const res = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({ success: true, message: 'New admin registered successfully!' });
                setEmail('');
                setPassword('');
            } else {
                setStatus({ success: false, error: data.error || 'Registration failed' });
            }
        } catch (error) {
            setStatus({ success: false, error: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Register New Admin</h1>
                <p className={styles.subtitle}>Create a secondary administrator account.</p>

                {status.success && (
                    <div className={styles.successMessage}>
                        {status.message}
                    </div>
                )}

                {status.error && (
                    <div className={styles.errorMessage}>
                        {status.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@phonemallexpress.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePasswordBtn}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? 'Creating Account...' : 'Register Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
