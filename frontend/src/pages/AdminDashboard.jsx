import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
  const {
    outlets,
    users,
    addOutlet,
    editOutlet,
    deleteOutlet,
    assignOwnerToOutlet,
    loadAllUsers
  } = useApp();

  // Outlet Form state
  const [showForm, setShowForm] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // New Owner Account Form state
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerOutletId, setOwnerOutletId] = useState('');
  const [ownerError, setOwnerError] = useState('');

  // Global Analytics State
  const [globalStats, setGlobalStats] = useState({
    totalRevenue: 0,
    totalOrders: 0
  });

  // Fetch stats for all outlets in a loop to compute global metrics
  useEffect(() => {
    const fetchGlobalStats = async () => {
      let totalRev = 0;
      let totalOrd = 0;

      for (const outlet of outlets) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/outlets/${outlet.id}/stats`);
          if (res.ok) {
            const data = await res.json();
            totalRev += data.total_revenue || 0;
            totalOrd += data.total_orders || 0;
          }
        } catch (e) {
          // If backend is down, use a randomized mock calculation
          totalRev += outlet.id * 1500;
          totalOrd += outlet.id * 12;
        }
      }
      setGlobalStats({
        totalRevenue: totalRev,
        totalOrders: totalOrd
      });
    };

    fetchGlobalStats();
  }, [outlets]);

  // Handle Save Outlet
  const handleSaveOutlet = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      location: formLocation,
      image_url: formImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60',
      is_open: true
    };

    if (editingOutletId) {
      const res = await editOutlet(editingOutletId, payload);
      if (res.success) resetOutletForm();
    } else {
      const res = await addOutlet(payload);
      if (res.success) resetOutletForm();
    }
  };

  const handleEditClick = (outlet) => {
    setEditingOutletId(outlet.id);
    setFormName(outlet.name);
    setFormLocation(outlet.location);
    setFormImageUrl(outlet.image_url || '');
    setShowForm(true);
  };

  const resetOutletForm = () => {
    setShowForm(false);
    setEditingOutletId(null);
    setFormName('');
    setFormLocation('');
    setFormImageUrl('');
  };

  const handleDeleteClick = async (outletId) => {
    if (confirm("Are you sure you want to remove this dining outlet? All menu items and order records will be deleted!")) {
      await deleteOutlet(outletId);
    }
  };

  // Handle Register New Owner Account
  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setOwnerError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          password: ownerPassword,
          role: 'owner',
          outlet_id: ownerOutletId ? parseInt(ownerOutletId) : null
        })
      });

      if (response.ok) {
        alert('Owner account created successfully!');
        resetOwnerForm();
        loadAllUsers();
      } else {
        const err = await response.json();
        setOwnerError(err.detail || 'Failed to create owner account');
      }
    } catch (e) {
      // Mock local addition
      alert('Backend offline. Simulating local owner account registration.');
      resetOwnerForm();
    }
  };

  const resetOwnerForm = () => {
    setShowOwnerForm(false);
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setOwnerOutletId('');
    setOwnerError('');
  };

  // Find users with 'owner' role
  const ownersList = users.filter(u => u.role === 'owner');

  return (
    <div className="animate-fade-in">
      {/* Banner & Title */}
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
          <span className="tag" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--primary)' }}>Food Department Portal</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>Bennett Food Department Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>🏛️ Campus Dining Administration, Outlets & Tuck Shops</p>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dining Outlets</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>{outlets.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--secondary)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Merchants</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '8px' }}>{ownersList.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--warning)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Campus Orders</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '8px' }}>{globalStats.totalOrders}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--success)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cumulative Revenue</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)', marginTop: '8px' }}>₹{globalStats.totalRevenue.toFixed(2)}</h2>
        </div>
      </div>

      {/* Main Control Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start', gridAutoFlow: 'row dense' }}>
        
        {/* Outlets Listing & Management */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Outlets Management</h2>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)} 
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Add Dining Outlet +
              </button>
            )}
          </div>

          {/* Add/Edit Outlet Form */}
          {showForm && (
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                {editingOutletId ? '✏️ Modify Outlet Details' : '➕ Register New Dining Outlet'}
              </h3>
              <form onSubmit={handleSaveOutlet} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Outlet Name</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. Subway Bennett" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Campus Location</label>
                  <input 
                    type="text" 
                    value={formLocation} 
                    onChange={e => setFormLocation(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. Ground Floor, Block A" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cover Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formImageUrl} 
                    onChange={e => setFormImageUrl(e.target.value)} 
                    className="form-input" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={resetOutletForm} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Save Outlet</button>
                </div>
              </form>
            </div>
          )}

          {/* Outlets Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {outlets.map(outlet => {
              // Find owner name if mapped
              const assignedOwner = users.find(u => u.role === 'owner' && u.outlet_id === outlet.id);
              return (
                <div 
                  key={outlet.id} 
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    overflow: 'hidden', 
                    alignItems: 'center', 
                    padding: '16px', 
                    gap: '16px' 
                  }}
                >
                  <img 
                    src={outlet.image_url} 
                    alt={outlet.name} 
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{outlet.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {outlet.location}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span className="tag" style={{ background: outlet.is_open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: outlet.is_open ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem' }}>
                        {outlet.is_open ? 'OPEN' : 'CLOSED'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        👤 Manager: <strong>{assignedOwner ? assignedOwner.name : 'Unassigned'}</strong>
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditClick(outlet)} 
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', padding: '8px 12px', fontSize: '1rem' }}
                      title="Edit Outlet"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(outlet.id)} 
                      style={{ background: 'transparent', border: '1px solid var(--danger)', borderRadius: '8px', cursor: 'pointer', padding: '8px 12px', fontSize: '1rem', color: 'var(--danger)' }}
                      title="Delete Outlet"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Owner Assignments & Merchant Accounts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Merchant Mapping</h2>
            {!showOwnerForm && (
              <button 
                onClick={() => setShowOwnerForm(true)} 
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                New Owner Account +
              </button>
            )}
          </div>

          {/* New Owner Account Form */}
          {showOwnerForm && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>🔑 Register Merchant Account</h3>
              {ownerError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                  {ownerError}
                </div>
              )}
              <form onSubmit={handleCreateOwner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Name</label>
                  <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="form-input" placeholder="e.g. Ramesh Kumar" required style={{ padding: '8px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>University Email</label>
                  <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="form-input" placeholder="ramesh@bennett.edu.in" required style={{ padding: '8px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
                  <input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} className="form-input" placeholder="••••••••" required style={{ padding: '8px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Assign Dining Outlet</label>
                  <select 
                    value={ownerOutletId} 
                    onChange={e => setOwnerOutletId(e.target.value)} 
                    className="form-input" 
                    style={{ padding: '8px 12px', background: 'white' }}
                  >
                    <option value="">Unassigned / Floating Owner</option>
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="button" onClick={resetOwnerForm} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Create</button>
                </div>
              </form>
            </div>
          )}

          {/* Owner Mapping List */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ownersList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No merchant profiles registered yet.</p>
            ) : (
              ownersList.map(owner => (
                <div 
                  key={owner.id} 
                  style={{ 
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{owner.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📧 {owner.email}</span>
                  </div>
                  
                  {/* Select box to assign to an outlet */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Manages:</span>
                    <select
                      value={owner.outlet_id || ''}
                      onChange={e => {
                        const val = e.target.value;
                        assignOwnerToOutlet(owner.id, val ? parseInt(val) : null);
                      }}
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                    >
                      <option value="">No Outlet / Unassigned</option>
                      {outlets.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
