import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const { login, setActivePage } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.detail || 'Failed to authenticate');
      }
    } else {
      // In standalone fallback mode, register redirects to login
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        setLoading(false);
        if (response.ok) {
          alert('Registration successful! Please login.');
          setIsLogin(true);
        } else {
          const err = await response.json();
          setError(err.detail || 'Registration failed');
        }
      } catch (e) {
        setLoading(false);
        setError('Connection failed. Standalone registration disabled. Use mock credentials (see tip below).');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', width: '100%' }} className="animate-fade-in">
      <div className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Login to UniBites' : 'Create Student Account'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input" 
                placeholder="Rahul Sharma" 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">University Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="form-input" 
              placeholder="rahul@bennett.edu.in" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">I am registering as a:</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="form-input"
                style={{ background: '#ffffff', color: 'var(--text-main)' }}
              >
                <option value="student">Student / Campus Customer</option>
                <option value="owner">Outlet / Tuck Shop Owner</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In 🔑' : 'Sign Up 📝'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>

      {/* Demo helper logins */}
      <div className="glass-card" style={{ padding: '16px', marginTop: '24px', fontSize: '0.8rem', background: 'rgba(15, 23, 42, 0.02)' }}>
        <h4 style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}>💡 Quick Demo Access Credentials</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p>🧑‍🎓 <strong>Student:</strong> student@bennett.edu.in | <em>student123</em></p>
          <p>🍳 <strong>Dev's Cafe Owner:</strong> owner@bennett.edu.in | <em>owner123</em></p>
          <p>🌯 <strong>Kathi Roll Owner:</strong> kathi_owner@bennett.edu.in | <em>owner123</em></p>
          <p>🍜 <strong>Maggi Hotspot Owner:</strong> maggi_owner@bennett.edu.in | <em>owner123</em></p>
          <p>🥦 <strong>Mess Coordinator:</strong> mess_coordinator@bennett.edu.in | <em>owner123</em></p>
          <p>👑 <strong>Food Dept Head (Admin):</strong> admin@bennett.edu.in | <em>admin123</em></p>
        </div>
      </div>
    </div>
  );
}
