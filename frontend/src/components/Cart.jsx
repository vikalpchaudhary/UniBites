import React from 'react';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal, placeOrder } = useApp();

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

      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
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
        onClick={placeOrder} 
        className="btn-primary" 
        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
      >
        Place Order 🚀
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
        Orders are delivered straight to hostels, libraries, or academic blocks!
      </p>
    </div>
  );
}
