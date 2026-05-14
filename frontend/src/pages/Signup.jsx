import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
      toast.success('Account created! Welcome to TaskFlow 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 70% 60%, rgba(124,106,247,0.08) 0%, transparent 60%), var(--bg)',
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)',
            borderRadius: 16, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, marginBottom: 16
          }}>⬡</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Join TaskFlow</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Create your team workspace</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" className="form-control" placeholder="Jane Smith"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" className="form-control" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <small style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
                First registered user automatically becomes Admin
              </small>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 20, fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
