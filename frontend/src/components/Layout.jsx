import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: '⬡',
  projects: '◈',
  tasks: '◻',
  team: '◉',
  logout: '⇥',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const getAvatarColor = (name) => {
    const colors = ['#7c6af7','#34d399','#60a5fa','#fbbf24','#f87171','#a78bfa'];
    let hash = 0;
    for (let c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18
            }}>⬡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>TaskFlow</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>Team Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.1em', padding: '8px 4px 6px', textTransform: 'uppercase' }}>Menu</div>
          {[
            { to: '/dashboard', label: 'Dashboard', icon: '▦' },
            { to: '/projects', label: 'Projects', icon: '◈' },
            { to: '/tasks', label: 'My Tasks', icon: '☑' },
            { to: '/team', label: 'Team', icon: '⬡' },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar" style={{ background: getAvatarColor(user?.name) }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            ⇥ Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
