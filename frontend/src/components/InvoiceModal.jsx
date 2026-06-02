import React from 'react';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const cgst = order.total_amount * 0.025; // 2.5% CGST
  const sgst = order.total_amount * 0.025; // 2.5% SGST
  const grandTotal = order.total_amount + cgst + sgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="invoice-modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="invoice-card"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#0f172a',
          width: '100%',
          maxWidth: '460px',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Scissor Cut Receipt Line on Top */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '20px',
          right: '20px',
          height: '16px',
          background: 'radial-gradient(circle, transparent, transparent 50%, #ffffff 50%, #ffffff 100%)',
          backgroundSize: '12px 16px',
          display: 'none' // Can styling be added later
        }} />

        {/* Invoice Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            🍽️ UniBites Invoice
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px 0', color: '#1e293b' }}>
            {order.outlet?.name || 'UniBites Diners'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            📍 {order.outlet?.location || 'Bennett University Campus'}
          </p>
        </div>

        {/* Dashed Separator */}
        <div style={{ borderTop: '2px dashed #e2e8f0', margin: '20px 0' }} />

        {/* Invoice Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Order ID / Receipt No</span>
            <strong style={{ color: '#1e293b' }}>#UB-{order.id}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Date & Time</span>
            <strong style={{ color: '#1e293b' }}>
              {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Student / Customer</span>
            <strong style={{ color: '#1e293b' }}>{order.user?.name || 'Bennett Student'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
            <strong style={{ color: '#1e293b', wordBreak: 'break-all' }}>{order.user?.email || 'student@bennett.edu.in'}</strong>
          </div>
        </div>

        {/* Dashed Separator */}
        <div style={{ borderTop: '2px dashed #e2e8f0', margin: '20px 0' }} />

        {/* Item List Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
          <span>Description</span>
          <span style={{ textAlign: 'center' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>

        {/* Item Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
          {order.items.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
              <span style={{ fontWeight: 500 }}>
                {item.menu_item?.name}
                {item.menu_item?.is_veg !== undefined && (
                  <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '0.7rem' }}>
                    {item.menu_item.is_veg ? '🟢' : '🔴'}
                  </span>
                )}
              </span>
              <span style={{ textAlign: 'center', color: '#64748b' }}>x{item.quantity}</span>
              <span style={{ textAlign: 'right', fontWeight: 600 }}>
                ₹{(item.price_at_order * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Calculation Table */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem' }}>
            <span>CGST (2.5%)</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem' }}>
            <span>SGST (2.5%)</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '8px' }}>
            <span>Grand Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Dashed Separator */}
        <div style={{ borderTop: '2px dashed #e2e8f0', margin: '20px 0' }} />

        {/* Transaction Footnotes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569', marginBottom: '24px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Payment Mode</span>
            <strong style={{ textTransform: 'uppercase' }}>
              {order.payment_method === 'upi' ? '📱 UPI Web Checkout' : '💵 Cash on Counter'}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Status</span>
            <strong style={{ 
              color: order.payment_status === 'completed' || order.status === 'completed' ? 'var(--success)' : '#f59e0b',
              textTransform: 'uppercase'
            }}>
              {order.payment_status === 'completed' ? 'PAID' : 'PENDING'}
            </strong>
          </div>
        </div>

        {/* Mock QR / Verification Barcode for Scanning */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '3px', height: '36px', alignItems: 'center' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px', 
                  height: '100%', 
                  background: '#1e293b' 
                }} 
              />
            ))}
          </div>
          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#64748b', letterSpacing: '0.15em' }}>
            *UBORDER{order.id}TOKENVERIFY*
          </span>
        </div>

        {/* Actions Row - HIDE DURING PRINT */}
        <div className="invoice-actions" style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            Close Receipt
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem', borderRadius: '12px', background: 'var(--primary)' }}
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
