import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Receipt, Settings, LogOut, Store, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, shop, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
  ];

  if (user?.role === 'owner') {
    navItems.push({ path: '/users', icon: UserPlus, label: 'Team' });
    navItems.push({ path: '/settings', icon: Settings, label: 'Settings' });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay open" onClick={closeSidebar} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={24} style={{ color: 'var(--primary)' }} />
            <h2>{shop?.name || 'CreditFlow'}</h2>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.role}</div>
          </div>
          <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        {children}
      </main>
    </div>
  );
};

export default Layout;
