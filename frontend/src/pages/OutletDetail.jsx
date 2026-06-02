import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Cart from '../components/Cart';

export default function OutletDetail() {
  const { getOutletDetail, addToCart, cart, setActivePage } = useApp();
  const outlet = getOutletDetail();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  if (!outlet) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h3>Outlet not found</h3>
        <button onClick={() => setActivePage('browse')} className="btn-primary" style={{ marginTop: '16px' }}>Back to Browse</button>
      </div>
    );
  }

  // Get unique categories
  const categories = ['All', ...new Set((outlet.items || []).map(item => item.category))];

  // Filter items
  const filteredItems = (outlet.items || []).filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesVeg = !vegOnly || item.is_veg;
    return matchesCategory && matchesVeg;
  });

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => setActivePage('browse')} 
        className="btn-secondary" 
        style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        ← Back to Browse
      </button>

      {/* Outlet Details Banner */}
      <div 
        className="glass-card" 
        style={{ 
          display: 'flex', 
          gap: '24px', 
          padding: '24px', 
          marginBottom: '32px', 
          alignItems: 'center', 
          flexWrap: 'wrap'
        }}
      >
        <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f1f5f9' }}>
          <img src={outlet.image_url} alt={outlet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{outlet.name}</h1>
            <span className={`tag ${outlet.is_open ? 'tag-outlet-open' : 'tag-outlet-closed'}`} style={{ padding: '4px 10px', fontSize: '0.65rem' }}>
              {outlet.is_open ? 'Open' : 'Closed'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '4px' }}>📍 {outlet.location}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {outlet.name === "BUN Mess Menu Helper" 
              ? "Daily menu schedule and timings for the central campus dining hall." 
              : "Serving hot meals directly to students. Cart handles one outlet checkout at a time."
            }
          </p>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                background: categoryFilter === cat ? 'var(--primary)' : 'rgba(15, 23, 42, 0.05)',
                color: categoryFilter === cat ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'var(--transition)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={vegOnly} 
            onChange={(e) => setVegOnly(e.target.checked)}
            style={{ accentColor: 'var(--success)', width: '16px', height: '16px' }}
          />
          🍀 Veg Only
        </label>
      </div>

      {/* Two Column Layout (Menu - Cart) */}
      <div style={{ display: 'grid', gridTemplateColumns: outlet.name === "BUN Mess Menu Helper" ? '1fr' : '1fr 340px', gap: '30px', alignItems: 'start', gridAutoFlow: 'row dense' }}>
        {/* Menu list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredItems.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No items found matching the selected filters.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const inCart = cart.find(i => i.item.id === item.id);
              const qty = inCart ? inCart.quantity : 0;
              const isMess = outlet.name === "BUN Mess Menu Helper";

              return (
                <div 
                  key={item.id} 
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px',
                    opacity: item.is_available && outlet.is_open ? 1 : 0.6
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`tag ${item.is_veg ? 'tag-veg' : 'tag-nonveg'}`} style={{ fontSize: '0.55rem' }}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h3>
                    {item.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {item.description}
                      </p>
                    )}
                    {!isMess && (
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{item.price}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {isMess ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '20px' }}>
                        📋 Included in Mess Card
                      </span>
                    ) : !outlet.is_open ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>Outlet Closed</span>
                    ) : !item.is_available ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>Out of Stock</span>
                    ) : qty > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{qty} added</span>
                        <button 
                          onClick={() => addToCart(item)}
                          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item)} 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Sidebar */}
        {outlet.name !== "BUN Mess Menu Helper" && (
          <div>
            <Cart />
          </div>
        )}
      </div>
    </div>
  );
}
