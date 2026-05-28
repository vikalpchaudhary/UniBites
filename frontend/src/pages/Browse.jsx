import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Browse() {
  const { outlets, setSelectedOutletId, setActivePage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectOutlet = (id) => {
    setSelectedOutletId(id);
    setActivePage('outlet-detail');
  };

  const filteredOutlets = outlets.filter(outlet => {
    const matchesName = outlet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = outlet.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if any items inside the menu match search
    const matchesItems = outlet.items && outlet.items.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesName || matchesLocation || matchesItems;
  });

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(59, 130, 246, 0.06) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 32px',
          textAlign: 'center',
          marginBottom: '40px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Hungry on Campus? 🍕
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 24px' }}>
          Order from Bennett University tuck shops, Cafeterias, or view the Student Mess menu in real-time.
        </p>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Search Dev's Cafe, Kathi Rolls, Maggi, or Coffee..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              borderRadius: '40px',
              padding: '16px 24px',
              paddingLeft: '48px',
              fontSize: '1rem',
              border: '1px solid var(--border-color)'
            }}
          />
          <span style={{ position: 'absolute', left: '20px', top: '16px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>🔍</span>
        </div>
      </div>

      {/* Main Grid */}
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🍔 Campus Dining Outlets
      </h2>

      {filteredOutlets.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No outlets found matching "{searchQuery}"</h3>
          <p style={{ marginTop: '8px' }}>Try searching something else like "Tea", "Roll", or "Sandwich".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredOutlets.map(outlet => (
            <div 
              key={outlet.id} 
              className="glass-card"
              onClick={() => handleSelectOutlet(outlet.id)}
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden' }}
            >
              {/* Card Header Image */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                {outlet.image_url ? (
                  <img 
                    src={outlet.image_url} 
                    alt={outlet.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '2rem' }}>🥣</div>
                )}
                
                {/* Status Tags */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <span className={`tag ${outlet.is_open ? 'tag-outlet-open' : 'tag-outlet-closed'}`} style={{ padding: '6px 12px', fontSize: '0.65rem' }}>
                    {outlet.is_open ? '● Open' : '○ Closed'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{outlet.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    📍 {outlet.location}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {outlet.items ? `${outlet.items.length} items available` : 'Menu loaded'}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Menu ➔
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
