import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const statusColors = { todo: 'var(--text2)', 'in-progress': 'var(--info)', review: 'var(--warning)', done: 'var(--success)' };
const priorityEmoji = { low: '↓', medium: '→', high: '↑', critical: '⚡' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const statusMap = {};
  (data?.byStatus || []).forEach(s => { statusMap[s._id] = s.count; });

  const stats = [
    { label: 'Total Tasks', value: data?.total || 0, color: 'var(--accent)', icon: '◻' },
    { label: 'My Tasks', value: data?.myTasks || 0, color: 'var(--info)', icon: '☑' },
    { label: 'In Progress', value: statusMap['in-progress'] || 0, color: 'var(--warning)', icon: '⟳' },
    { label: 'Overdue', value: data?.overdue || 0, color: 'var(--danger)', icon: '⚠' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's what's happening
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4 gap-4" style={{ marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: '2.5rem', opacity: 0.08, color: stat.color
            }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 32 }}>
        {/* By Status */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Tasks by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['todo', 'in-progress', 'review', 'done'].map(status => {
              const count = statusMap[status] || 0;
              const total = data?.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', color: statusColors[status] }}>{statusLabels[status]}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: statusColors[status], borderRadius: 3,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue tasks */}
        <div className="card">
          <h3 style={{ marginBottom: 16, color: data?.overdue > 0 ? 'var(--danger)' : undefined }}>
            {data?.overdue > 0 ? '⚠ Overdue Tasks' : '✓ No Overdue Tasks'}
          </h3>
          {data?.overdueTasks?.length === 0 ? (
            <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
              All caught up!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data?.overdueTasks?.map(task => (
                <div key={task._id} style={{
                  padding: '10px 12px', background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8
                }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                    Due {format(new Date(task.dueDate), 'MMM d')} · {task.project?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Recent Activity</h3>
          <Link to="/tasks" style={{ color: 'var(--accent2)', textDecoration: 'none', fontSize: '0.85rem' }}>
            View all →
          </Link>
        </div>
        {data?.recentTasks?.length === 0 ? (
          <div className="empty-state">
            <div className="icon">◻</div>
            <h3>No tasks yet</h3>
            <p>Create a project and add tasks to get started</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentTasks?.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {priorityEmoji[task.priority]} {task.title}
                    </div>
                  </td>
                  <td>
                    <Link to={`/projects/${task.project?._id}`} style={{ color: 'var(--accent2)', textDecoration: 'none', fontSize: '0.85rem' }}>
                      {task.project?.name}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                    {task.assignee?.name || '—'}
                  </td>
                  <td><span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span></td>
                  <td style={{ color: task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'var(--danger)' : 'var(--text2)', fontSize: '0.85rem' }}>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
