import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 40%, rgba(124,106,247,0.08) 0%, transparent 60%), var(--bg)',
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)',
            borderRadius: 16, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, marginBottom: 16
          }}>⬡</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>TaskFlow</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Sign in to your workspace</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 20, fontSize: '0.9rem' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
