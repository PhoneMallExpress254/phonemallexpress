"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ShieldCheck, Truck, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import './Checkout.css';

const CheckoutPage = () => {
    const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        shippingMethod: 'standard',
        paymentMethod: 'mpesa'
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    if (cart.length === 0) {
        return (
            <div className="container section-py empty-checkout">
                <h2>Your cart is empty</h2>
                <p>Add some premium accessories to your cart to proceed with checkout.</p>
                <Link href="/accessories" className="btn btn-primary">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="checkout-page section-py">
            <div className="container checkout-container">
                <div className="checkout-main">
                    {/* Progress Steps */}
                    <div className="checkout-steps">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-num">1</span>
                            <span className="step-label">Info</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-num">2</span>
                            <span className="step-label">Shipping</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-label">Payment</span>
                        </div>
                    </div>

                    <div className="step-content">
                        {step === 1 && (
                            <div className="step-info">
                                <h3 className="section-title">Customer Information</h3>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" placeholder="you@example.com" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input type="text" id="firstName" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" id="lastName" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Delivery Address</label>
                                    <input type="text" id="address" placeholder="Stree name, Apartment, etc." />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input type="text" id="city" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input type="tel" id="phone" placeholder="0712 345 678" />
                                    </div>
                                </div>
                                <div className="step-actions">
                                    <div></div>
                                    <button className="btn btn-primary" onClick={handleNext}>
                                        Continue to Shipping
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-shipping">
                                <h3 className="section-title">Shipping Method</h3>
                                <div className="shipping-options">
                                    <label className="shipping-option">
                                        <input type="radio" name="shipping" defaultChecked />
                                        <div className="option-info">
                                            <span className="option-name">Standard Delivery (Nairobi)</span>
                                            <span className="option-time">1-2 business days</span>
                                        </div>
                                        <span className="option-price">KSh 300</span>
                                    </label>
                                    <label className="shipping-option">
                                        <input type="radio" name="shipping" />
                                        <div className="option-info">
                                            <span className="option-name">Standard Delivery (Upcountry)</span>
                                            <span className="option-time">2-4 business days</span>
                                        </div>
                                        <span className="option-price">KSh 500</span>
                                    </label>
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-link" onClick={handleBack}>Back to Info</button>
                                    <button className="btn btn-primary" onClick={handleNext}>
                                        Continue to Payment
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-payment">
                                <h3 className="section-title">Payment Method</h3>
                                <div className="payment-options">
                                    <label className="payment-option">
                                        <input type="radio" name="payment" defaultChecked />
                                        <div className="option-info">
                                            <span className="option-name">M-PESA / Mobile Money</span>
                                            <span className="option-desc">Pay via Lipa na M-Pesa</span>
                                        </div>
                                        <CreditCard size={24} />
                                    </label>
                                    <label className="payment-option">
                                        <input type="radio" name="payment" />
                                        <div className="option-info">
                                            <span className="option-name">Credit / Debit Card</span>
                                            <span className="option-desc">Powered by Flutterwave</span>
                                        </div>
                                        <CreditCard size={24} />
                                    </label>
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-link" onClick={handleBack}>Back to Shipping</button>
                                    <button className="btn btn-primary">
                                        Complete Purchase
                                        <ShieldCheck size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="order-summary-card">
                        <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
                            <h3 className="card-title" style={{ margin: 0, border: 0, padding: 0 }}>Order Summary</h3>
                            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>{totalItems} items</span>
                        </div>

                        <div className="summary-items">
                            {cart.map((item) => (
                                <div key={item.id} className="summary-item-interactive">
                                    <div className="item-img-container">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded-md"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                                <ShoppingCart size={20} className="text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-details">
                                        <div className="flex justify-between items-start gap-xs">
                                            <span className="item-name">{item.name}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="remove-item-btn"
                                                aria-label="Remove item"
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <div className="item-actions">
                                            <div className="mini-qty-selector">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <span className="item-price">KSh {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>KSh {totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>KSh 300</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>KSh {(totalPrice + 300).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="trust-badges">
                            <div className="badge">
                                <ShieldCheck size={16} />
                                <span>SSL Encrypted</span>
                            </div>
                            <div className="badge">
                                <Truck size={16} />
                                <span>Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
