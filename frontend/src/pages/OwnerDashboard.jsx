import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import InvoiceModal from '../components/InvoiceModal';

export default function OwnerDashboard() {
  const { 
    outlets, 
    orders, 
    updateOrderStatus, 
    toggleOutletStatus, 
    toggleItemAvailability,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    user
  } = useApp();

  // Add Item / Edit Item Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // States for Queue, Filtering & Receipt view
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Snacks');
  const [formIsVeg, setFormIsVeg] = useState(true);

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const itemPayload = {
      name: formName,
      description: formDescription || null,
      price: parseFloat(formPrice),
      category: formCategory,
      is_veg: formIsVeg,
      is_available: true
    };

    if (editingId) {
      const res = await editMenuItem(editingId, itemPayload);
      if (res.success) {
        resetForm();
      }
    } else {
      const res = await addMenuItem(user.outlet_id, itemPayload);
      if (res.success) {
        resetForm();
      }
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormIsVeg(item.is_veg);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('Snacks');
    setFormIsVeg(true);
  };

  const handleDeleteClick = async (itemId) => {
    if (confirm("Are you sure you want to delete this item from your menu?")) {
      await deleteMenuItem(itemId);
    }
  };

  const myOutlet = user?.outlet_id ? outlets.find(o => o.id === user.outlet_id) : null;
  const myOrders = user?.outlet_id 
    ? orders.filter(o => o.outlet_id === user.outlet_id || o.outlet.id === user.outlet_id) 
    : [];

  if (!myOutlet) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h3>Outlet Not Found</h3>
        <p>Your user profile is not linked to any active dining outlet.</p>
      </div>
    );
  }

  // Calculate Statistics
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const cancelledOrders = myOrders.filter(o => o.status === 'cancelled');

  // FIFO Queue: Oldest active orders prepared first
  const pendingOrders = myOrders
    .filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const averageBill = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;
  const completionRate = myOrders.length > 0 ? (completedOrders.length / myOrders.length) * 100 : 0;

  const revenueByCategory = {};
  completedOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const category = item.menu_item?.category || 'General';
      const amount = item.price_at_order * item.quantity;
      revenueByCategory[category] = (revenueByCategory[category] || 0) + amount;
    });
  });
  const maxRevenue = Math.max(...Object.values(revenueByCategory), 0);

  // History orders (newest first)
  const historyOrders = myOrders
    .filter(o => ['completed', 'cancelled'].includes(o.status))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Search & Payment Filter for History
  const filteredHistory = historyOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toString().includes(searchQuery) ||
      (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'All' || order.payment_method === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="animate-fade-in">
      {/* Banner & Control Card */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '28px', 
          marginBottom: '32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '20px' 
        }}
      >
        <div>
          <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--secondary)' }}>Merchant Portal</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{myOutlet.name} Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>📍 {myOutlet.location}</p>
        </div>

        {/* Open / Closed Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: myOutlet.is_open ? 'var(--success)' : 'var(--danger)' }}>
            Outlet is {myOutlet.is_open ? 'OPEN' : 'CLOSED'}
          </span>
          <button
            onClick={() => toggleOutletStatus(myOutlet.id, !myOutlet.is_open)}
            className="btn-primary"
            style={{
              background: myOutlet.is_open ? 'var(--danger)' : 'var(--success)',
              boxShadow: 'none',
              padding: '10px 20px',
              fontSize: '0.85rem'
            }}
          >
            {myOutlet.is_open ? 'Close Outlet 🛑' : 'Open Outlet 🟢'}
          </button>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>{myOrders.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--warning)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Orders</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '8px' }}>{pendingOrders.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--success)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)', marginTop: '8px' }}>₹{totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: 'var(--secondary)' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Queue Progress</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {completedOrders.length} / {myOrders.length}
            </h2>
          </div>
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <svg width="64" height="64" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="30" stroke="var(--border-color)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="36" 
                cy="36" 
                r="30" 
                stroke="var(--secondary)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="188.4" 
                strokeDashoffset={188.4 - (188.4 * completionRate) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)' }}>
              {Math.round(completionRate)}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Order Management (Left) vs Inventory Stock Control (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start', gridAutoFlow: 'row dense' }}>
        
        {/* Left Column: Switcher + Active Queue / Bill History */}
        <div>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('queue')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'queue' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'queue' ? '3px solid var(--primary)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              👨‍🍳 Active Queue ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              📜 Bill & Sales History ({historyOrders.length})
            </button>
          </div>

          {activeTab === 'queue' ? (
            /* Queue Section */
            pendingOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨</div>
                <h3>All caught up!</h3>
                <p>No active orders are waiting to be processed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingOrders.map((order, index) => (
                  <div key={order.id} className="glass-card" style={{ padding: '20px', borderLeft: `4px solid ${order.status === 'pending' ? 'var(--warning)' : order.status === 'preparing' ? 'var(--secondary)' : 'var(--primary)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700 }}>Order #{order.id}</span>
                        <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', fontWeight: 700, fontSize: '0.75rem', padding: '2px 8px' }}>
                          Queue Position: #{index + 1}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="tag" style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '4px 8px' }}>
                        Status: <strong style={{ color: 'var(--primary)' }}>{order.status.toUpperCase()}</strong>
                      </span>
                    </div>

                    {/* Customer Student Details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', background: 'rgba(15,23,42,0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                      <span>👤 Student: <strong style={{ color: 'var(--text-main)' }}>{order.user?.name || 'Bennett Student'}</strong></span>
                      <span>📧 Email: <strong style={{ color: 'var(--text-main)' }}>{order.user?.email || 'student@bennett.edu.in'}</strong></span>
                    </div>

                    {/* Order Items */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                          <span>{item.menu_item?.name || 'Menu Item'} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong></span>
                          <span>₹{(item.price_at_order * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Total Amount</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                        <span>Payment Details</span>
                        <span style={{ fontWeight: 600, color: order.payment_method === 'upi' ? 'var(--success)' : 'var(--warning)' }}>
                          {order.payment_method === 'upi' ? '📱 UPI (PAID)' : '💵 COD (COLLECT CASH)'}
                        </span>
                      </div>
                    </div>

                    {/* Lifecycle Controls */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* Shared Receipt Button */}
                      <button 
                        onClick={() => setSelectedInvoiceOrder(order)} 
                        className="btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '0.8rem', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        🧾 View Bill
                      </button>

                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                            className="btn-secondary" 
                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            Reject Order
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')} 
                            className="btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            Accept & Prepare 👨‍🍳
                          </button>
                        </>
                      )}

                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'ready')} 
                          className="btn-primary" 
                          style={{ background: 'var(--warning)', boxShadow: 'none', padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          Mark Ready for Dispatch 🔔
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'completed')} 
                          className="btn-primary" 
                          style={{ background: 'var(--success)', boxShadow: 'none', padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          Complete / Delivered ✅
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* History Section */
            <div>
              {/* Analytics report row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Earnings</span>
                  <h4 style={{ margin: '4px 0 0 0', color: 'var(--success)', fontSize: '1.2rem', fontWeight: 700 }}>₹{totalRevenue.toFixed(2)}</h4>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Ticket Size</span>
                  <h4 style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700 }}>₹{averageBill.toFixed(2)}</h4>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.05)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Orders</span>
                  <h4 style={{ margin: '4px 0 0 0', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>{completedOrders.length}</h4>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cancelled / Rejected</span>
                  <h4 style={{ margin: '4px 0 0 0', color: 'var(--danger)', fontSize: '1.2rem', fontWeight: 700 }}>{cancelledOrders.length}</h4>
                </div>
              </div>

              {/* Sales by Category SVG Chart */}
              {completedOrders.length > 0 && Object.keys(revenueByCategory).length > 0 && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>📊 Revenue by Food Category</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(revenueByCategory).map(([cat, rev]) => {
                      const percentage = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                      return (
                        <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600 }}>{cat}</span>
                            <span style={{ color: 'var(--text-muted)' }}>₹{rev.toFixed(2)} ({Math.round((rev / totalRevenue) * 100)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${percentage}%`, 
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))', 
                                borderRadius: '4px',
                                transition: 'width 0.8s ease'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filters Panel */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Bill ID or Student Name..."
                  className="form-input"
                  style={{ flex: 2, minWidth: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
                />
                
                <select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, minWidth: '100px', padding: '8px 12px', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="All">All Payments</option>
                  <option value="upi">UPI Web</option>
                  <option value="cod">COD Cash</option>
                </select>
              </div>

              {/* History List */}
              {filteredHistory.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <h3>No historical records found</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try adjusting your search query or filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredHistory.map(order => (
                    <div 
                      key={order.id} 
                      className="glass-card" 
                      style={{ 
                        padding: '16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: `4px solid ${order.status === 'completed' ? 'var(--success)' : 'var(--danger)'}`,
                        opacity: 0.9
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>Bill #UB-{order.id}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: order.status === 'completed' ? 'var(--success)' : 'var(--danger)', background: order.status === 'completed' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', padding: '2px 8px', borderRadius: '12px' }}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          👤 Student: <strong style={{ color: 'var(--text-main)' }}>{order.user?.name || 'Bennett Student'}</strong> | Total: <strong style={{ color: 'var(--text-main)' }}>₹{order.total_amount.toFixed(2)}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          🍽️ {order.items.map(item => `${item.menu_item?.name || 'Item'} x${item.quantity}`).join(', ')}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {order.payment_method === 'upi' ? '📱 UPI (PAID)' : '💵 COD'}
                        </span>
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          🧾 Bill Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inventory Stock Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Menu Stock Manager</h2>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)} 
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Add Item +
              </button>
            )}
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {showForm && (
              <form onSubmit={handleSaveItem} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '10px' }} className="animate-fade-in">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                  {editingId ? 'Edit Menu Item ✏️' : 'Add New Menu Item ➕'}
                </h3>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Item Name</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="form-input" placeholder="e.g. Masala Dosa" required style={{ padding: '8px 12px' }} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Description</label>
                  <input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)} className="form-input" placeholder="e.g. Crispy crepe served with chutney" style={{ padding: '8px 12px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Price (₹)</label>
                    <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="form-input" placeholder="80" required style={{ padding: '8px 12px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="form-input" style={{ padding: '8px 12px', background: 'white' }}>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Rolls">Rolls</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Mess Menu">Mess Menu</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={formIsVeg} onChange={e => setFormIsVeg(e.target.checked)} style={{ accentColor: 'var(--success)', width: '14px', height: '14px' }} />
                    🍀 Vegetarian Item
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Save Product</button>
                </div>
              </form>
            )}

            {(myOutlet.items || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No menu items found. Add some to build your menu!</p>
            ) : (
              (myOutlet.items || []).map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '4px' 
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`tag ${item.is_veg ? 'tag-veg' : 'tag-nonveg'}`} style={{ fontSize: '0.55rem', padding: '2px 6px' }}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      ₹{item.price} | <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditClick(item)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }} 
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item.id)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }} 
                      title="Delete Item"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                      className="btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderColor: item.is_available ? 'var(--success)' : 'var(--danger)',
                        color: item.is_available ? 'var(--success)' : 'var(--danger)',
                        background: item.is_available ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        fontWeight: 600
                      }}
                    >
                      {item.is_available ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {selectedInvoiceOrder && (
        <InvoiceModal 
          order={selectedInvoiceOrder} 
          onClose={() => setSelectedInvoiceOrder(null)} 
        />
      )}
    </div>
  );
}
