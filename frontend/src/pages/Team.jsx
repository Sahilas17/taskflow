import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
const getAvatarColor = (name) => {
  const colors = ['#7c6af7','#34d399','#60a5fa','#fbbf24','#f87171','#a78bfa'];
  let hash = 0;
  for (let c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Team() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user._id) { toast.error("Can't change your own role"); return; }
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
      toast.success('Role updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const admins = users.filter(u => u.role === 'admin');
  const members = users.filter(u => u.role === 'member');

  return (
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <h1>Team</h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>{users.length} member{users.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-3 gap-4" style={{ marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{users.length}</div>
          <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Total Members</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent2)' }}>{admins.length}</div>
          <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Admins</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>{members.length}</div>
          <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Members</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>All Members</h3>
          {user?.role !== 'admin' && (
            <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Only admins can change roles</span>
          )}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ background: getAvatarColor(u.name), width: 36, height: 36, fontSize: '0.85rem' }}>
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {u.name}
                        {u._id === user._id && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text3)' }}>(you)</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                {user?.role === 'admin' && (
                  <td>
                    {u._id !== user._id ? (
                      <select
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
