import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#7c6af7','#34d399','#60a5fa','#fbbf24','#f87171','#a78bfa','#f472b6','#2dd4bf'];

function ProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', dueDate: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onSave(res.data);
      toast.success('Project created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Project Name *</label>
            <input className="form-control" placeholder="My Awesome Project" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" placeholder="What's this project about?" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid white' : '3px solid transparent',
                  boxSizing: 'border-box', transition: 'transform 0.1s'
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadProjects, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">◈</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            + Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-3 gap-4">
          {projects.map(project => {
            const progress = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  {/* Color accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: project.color }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, marginTop: 8 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: project.color + '22', border: `1px solid ${project.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, color: project.color
                    }}>◈</div>
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                  </div>

                  <h3 style={{ marginBottom: 6, color: 'var(--text)' }}>{project.name}</h3>
                  <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5, minHeight: 40 }}>
                    {project.description || 'No description'}
                  </p>

                  {/* Progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 6 }}>
                      <span>{project.completedCount}/{project.taskCount} tasks</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: project.color, borderRadius: 2 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text3)' }}>
                    <span>👤 {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
                    {project.dueDate && <span>📅 {format(new Date(project.dueDate), 'MMM d')}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSave={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
