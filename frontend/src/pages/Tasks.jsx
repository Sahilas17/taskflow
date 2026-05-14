import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import api from '../utils/api';

const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_EMOJI = { low: '↓', medium: '→', high: '↑', critical: '⚡' };
const PRIORITY_COLORS = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: 'var(--danger)' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const load = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    api.get(`/tasks?${params}`)
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filters]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch {}
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1>All Tasks</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control" style={{ width: 'auto' }} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            {['low','medium','high','critical'].map(p => <option key={p} value={p}>{PRIORITY_EMOJI[p]} {p}</option>)}
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">☑</div>
          <h3>No tasks found</h3>
          <p>Tasks will appear here once created in a project</p>
          <Link to="/projects" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go to Projects</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                    {task.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {task.tags.map(tag => (
                          <span key={tag} style={{ background: 'var(--bg3)', color: 'var(--text3)', padding: '1px 6px', borderRadius: 20, fontSize: '0.7rem' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {task.project && (
                      <Link to={`/projects/${task.project._id}`} style={{ color: 'var(--accent2)', textDecoration: 'none', fontSize: '0.85rem' }}>
                        {task.project.name}
                      </Link>
                    )}
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                    {task.assignee?.name || '—'}
                  </td>
                  <td>
                    <span style={{ color: PRIORITY_COLORS[task.priority], fontWeight: 600, fontSize: '0.85rem' }}>
                      {PRIORITY_EMOJI[task.priority]} {task.priority}
                    </span>
                  </td>
                  <td>
                    <select className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td style={{
                    fontSize: '0.85rem',
                    color: task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done'
                      ? 'var(--danger)' : 'var(--text2)'
                  }}>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
