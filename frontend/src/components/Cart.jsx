import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal, placeOrder } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'upi'
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [upiCountdown, setUpiCountdown] = useState(10);

  // UPI payment simulator timer
  useEffect(() => {
    if (!showUPIModal) return;
    if (upiCountdown === 0) {
      setShowUPIModal(false);
      placeOrder('upi');
      return;
    }
    const timer = setTimeout(() => {
      setUpiCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showUPIModal, upiCountdown]);

  const handleCheckoutClick = () => {
    if (paymentMethod === 'upi') {
      setUpiCountdown(10);
      setShowUPIModal(true);
    } else {
      placeOrder('cod');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛒</div>
        <h3>Your Cart is Empty</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Browse the campus tuck shops and mess helpers to add delicious bites!</p>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px', borderLeft: '3px solid var(--primary)', position: 'sticky', top: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order Summary</h3>
        <button 
          onClick={clearCart} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          Clear All
        </button>
      </div>

      {/* Cart Items list */}
      <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
        {cart.map(({ item, quantity }) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, paddingRight: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${item.is_veg ? 'tag-veg' : 'tag-nonveg'}`} style={{ fontSize: '0.55rem', padding: '2px 6px' }}>
                  {item.is_veg ? 'Veg' : 'Non-Veg'}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{item.price} each</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => removeFromCart(item.id)}
                style={{
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{quantity}</span>
              <button 
                onClick={() => addToCart(item)}
                style={{
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Selection Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-main)' }}>Select Payment Method</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setPaymentMethod('cod')}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border-color)',
              background: paymentMethod === 'cod' ? 'var(--primary-glow)' : '#ffffff',
              color: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'var(--transition)'
            }}
          >
            💵 Pay on Delivery
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-color)',
              background: paymentMethod === 'upi' ? 'var(--primary-glow)' : '#ffffff',
              color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'var(--transition)'
            }}
          >
            📱 UPI / Scan to Pay
          </button>
        </div>
      </div>

      {/* Billing total summary */}
      <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
          <span>₹{getCartTotal().toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Taxes & Delivery Fee</span>
          <span style={{ color: 'var(--success)' }}>FREE (Campus Delivery)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>₹{getCartTotal().toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={handleCheckoutClick} 
        className="btn-primary" 
        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
      >
        Place Order 🚀
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
        Orders are delivered straight to hostels, libraries, or academic blocks!
      </p>

      {/* UPI QR payment modal overlay */}
      {showUPIModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="glass-card animate-fade-in" 
            style={{ 
              maxWidth: '380px', 
              width: '100%', 
              padding: '28px', 
              textAlign: 'center', 
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Scan & Pay via UPI</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Scan QR code using Google Pay, PhonePe, Paytm or BHIM
            </p>

            <div style={{ display: 'inline-block', background: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=unibites@upi&pn=UniBites&am=${getCartTotal().toFixed(2)}&cu=INR&tn=UniBitesOrder`
                )}`} 
                alt="UPI QR Code" 
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '16px' }}>
              Amount: <span style={{ color: 'var(--primary)' }}>₹{getCartTotal().toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(244,63,94,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Checking payment status... {upiCountdown}s</span>
            </div>

            <button 
              onClick={() => setShowUPIModal(false)}
              className="btn-secondary" 
              style={{ width: '100%', marginTop: '24px', padding: '10px 0', fontSize: '0.85rem', justifyContent: 'center' }}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
