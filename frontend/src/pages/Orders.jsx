import React from 'react';
import { useApp } from '../context/AppContext';

export default function Orders() {
  const { orders, setActivePage } = useApp();

  const getStepNumber = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--warning)';
      case 'preparing': return 'var(--secondary)';
      case 'ready': return 'var(--primary)';
      case 'completed': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 0 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>📋 My Orders</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Track your active lunch deliveries and order history.</p>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No orders placed yet</h3>
          <p style={{ marginTop: '8px' }}>Go back to the outlets directory to order some food.</p>
          <button onClick={() => setActivePage('browse')} className="btn-primary" style={{ marginTop: '20px' }}>
            Browse Outlets
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const step = getStepNumber(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order #{order.id}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      From: <strong>{order.outlet.name}</strong> ({order.outlet.location})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span 
                      className="tag" 
                      style={{ 
                        background: getStatusColor(order.status) + '1a', 
                        color: getStatusColor(order.status),
                        border: `1px solid ${getStatusColor(order.status)}33`,
                        padding: '6px 12px',
                        fontWeight: 700
                      }}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Items Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', flexWrap: 'wrap', alignItems: 'start' }}>
                  {/* Item List */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Items Ordered</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span>{item.menu_item.name} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong></span>
                          <span>₹{(item.price_at_order * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total Paid</span>
                      <span style={{ color: 'var(--primary)' }}>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  {!isCancelled ? (
                    <div style={{ background: 'rgba(15, 23, 42, 0.01)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Order Status</h4>
                      
                      {/* Step 1 */}
                      <div style={{ display: 'flex', gap: '12px', position: 'relative', paddingBottom: '16px' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: step >= 1 ? 'var(--success)' : '#e2e8f0',
                          color: step >= 1 ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}>
                          {step >= 1 ? '✓' : '1'}
                        </div>
                        <div style={{ position: 'absolute', left: '9px', top: '20px', width: '2px', height: 'calc(100% - 10px)', background: step >= 2 ? 'var(--success)' : '#e2e8f0', zIndex: 1 }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Order Received</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waiting for shop approval</span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div style={{ display: 'flex', gap: '12px', position: 'relative', paddingBottom: '16px' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: step >= 2 ? 'var(--success)' : '#e2e8f0',
                          color: step >= 2 ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}>
                          {step >= 2 ? '✓' : '2'}
                        </div>
                        <div style={{ position: 'absolute', left: '9px', top: '20px', width: '2px', height: 'calc(100% - 10px)', background: step >= 3 ? 'var(--success)' : '#e2e8f0', zIndex: 1 }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Preparing</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your food is being freshly cooked</span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div style={{ display: 'flex', gap: '12px', position: 'relative', paddingBottom: '16px' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: step >= 3 ? 'var(--success)' : '#e2e8f0',
                          color: step >= 3 ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}>
                          {step >= 3 ? '✓' : '3'}
                        </div>
                        <div style={{ position: 'absolute', left: '9px', top: '20px', width: '2px', height: 'calc(100% - 10px)', background: step >= 4 ? 'var(--success)' : '#e2e8f0', zIndex: 1 }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>Out for Delivery / Ready</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rider enroute to your block</span>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: step >= 4 ? 'var(--success)' : '#e2e8f0',
                          color: step >= 4 ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}>
                          {step >= 4 ? '✓' : '4'}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= 4 ? 'var(--text-main)' : 'var(--text-muted)' }}>Delivered 🍽️</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enjoy your meal!</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--danger)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Order Cancelled</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>This order was rejected or cancelled by the outlet owner.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
