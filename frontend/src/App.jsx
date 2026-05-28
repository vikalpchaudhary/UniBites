import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Browse from './pages/Browse';
import OutletDetail from './pages/OutletDetail';
import MessHelper from './pages/MessHelper';
import Orders from './pages/Orders';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

function MainAppContent() {
  const { activePage, user } = useApp();

  const renderPage = () => {
    switch (activePage) {
      case 'browse':
        return <Browse />;
      case 'outlet-detail':
        return <OutletDetail />;
      case 'mess-helper':
        return <MessHelper />;
      case 'orders':
        return user && user.role === 'student' ? <Orders /> : <Auth />;
      case 'owner-dashboard':
        return user && user.role === 'owner' ? <OwnerDashboard /> : <Auth />;
      case 'admin-dashboard':
        return user && user.role === 'admin' ? <AdminDashboard /> : <Auth />;
      case 'auth':
        return <Auth />;
      default:
        return <Browse />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="container animate-fade-in" style={{ flex: 1 }}>
        {renderPage()}
      </main>
      
      {/* Footer */}
      <footer 
        style={{ 
          textAlign: 'center', 
          padding: '24px', 
          borderTop: '1px solid var(--border-color)', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem',
          background: 'rgba(11, 15, 25, 0.4)'
        }}
      >
        <p>© 2026 UniBites - Made with ❤️ for Bennett University students</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
