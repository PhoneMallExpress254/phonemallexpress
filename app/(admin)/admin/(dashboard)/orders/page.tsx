'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './orders.module.css';

interface OrderSummary {
    _id: string;
    customer: {
        name: string;
        email: string;
    };
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders');
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#22c55e';
            case 'Pending': return '#eab308';
            case 'Failed': return '#ef4444';
            case 'Shipped': return '#3b82f6';
            default: return '#888';
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: '#888' }}>Loading orders...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Orders</h1>

            {/* Desktop Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Order ID</th>
                            <th className={styles.th}>Customer</th>
                            <th className={styles.th}>Date</th>
                            <th className={styles.th}>Total</th>
                            <th className={styles.th}>Payment</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id}>
                                    <td className={styles.td} style={{ fontFamily: 'monospace', color: '#666', fontSize: '0.85rem' }}>
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className={styles.td}>
                                        <div style={{ fontWeight: '700', color: 'white' }}>{order.customer.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.customer.email}</div>
                                    </td>
                                    <td className={styles.td} style={{ color: '#888' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.td} style={{ fontWeight: '700' }}>
                                        KES {order.totalAmount.toLocaleString()}
                                    </td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.85rem', color: order.paymentMethod === 'M-Pesa' ? '#22c55e' : 'white' }}>
                                                {order.paymentMethod}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: getStatusColor(order.paymentStatus) }}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            border: `1px solid ${getStatusColor(order.status)}`,
                                            color: getStatusColor(order.status),
                                            background: `${getStatusColor(order.status)}10`
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'right' }}>
                                        <Link href={`/admin/orders/${order._id}`} className={styles.viewBtn}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className={styles.orderCardGrid}>
                {orders.map((order) => (
                    <div key={order._id} className={styles.orderCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                border: `1px solid ${getStatusColor(order.status)}`,
                                color: getStatusColor(order.status),
                                background: `${getStatusColor(order.status)}10`
                            }}>
                                {order.status}
                            </span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.customerName}>{order.customer.name}</div>
                            <div className={styles.customerEmail}>{order.customer.email}</div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>KES {order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <div style={{ fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Paid via: </span>
                                <span style={{ color: order.paymentMethod === 'M-Pesa' ? '#22c55e' : 'white' }}>{order.paymentMethod}</span>
                            </div>
                            <Link href={`/admin/orders/${order._id}`} className={styles.viewBtn}>
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
