import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout, switchUserRole, activePage, setActivePage, cart, theme, toggleTheme } = useApp();

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setActivePage('browse')}>
        <span>🍕 UniBites</span>
        <span style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 500 }}>| Bennett Univ</span>
      </div>

      <div className="navbar-links">
        <span 
          className={`navbar-link ${activePage === 'browse' || activePage === 'outlet-detail' ? 'active' : ''}`}
          onClick={() => setActivePage('browse')}
        >
          Browse Outlets
        </span>
        <span 
          className={`navbar-link ${activePage === 'mess-helper' ? 'active' : ''}`}
          onClick={() => setActivePage('mess-helper')}
        >
          Mess Menu
        </span>
        
        {user && user.role === 'student' && (
          <span 
            className={`navbar-link ${activePage === 'orders' ? 'active' : ''}`}
            onClick={() => setActivePage('orders')}
          >
            My Orders {cartItemsCount > 0 && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '50%', fontSize: '0.75rem', marginLeft: '4px' }}>{cartItemsCount}</span>}
          </span>
        )}

        {user && user.role === 'owner' && (
          <span 
            className={`navbar-link ${activePage === 'owner-dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('owner-dashboard')}
          >
            Owner Dashboard
          </span>
        )}

        {user && user.role === 'admin' && (
          <span 
            className={`navbar-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('admin-dashboard')}
          >
            Admin Dashboard
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'var(--transition)'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hi, <strong>{user.name.split(' ')[0]}</strong></span>
            <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Logout</button>
          </div>
        ) : (
          <button onClick={() => setActivePage('auth')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Login</button>
        )}
      </div>
    </nav>
  );
}
