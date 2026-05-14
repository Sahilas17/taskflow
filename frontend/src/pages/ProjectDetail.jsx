import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLS = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_COLORS = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: 'var(--danger)' };
const PRIORITY_EMOJI = { low: '↓', medium: '→', high: '↑', critical: '⚡' };

function TaskModal({ projectId, members, task, onClose, onSave }) {
  const [form, setForm] = useState(task || { title: '', description: '', assignee: '', status: 'todo', priority: 'medium', dueDate: '', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, project: projectId, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      const res = task
        ? await api.put(`/tasks/${task._id}`, payload)
        : await api.post('/tasks', payload);
      onSave(res.data, !!task);
      toast.success(task ? 'Task updated!' : 'Task created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Title *</label>
            <input className="form-control" placeholder="Task title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" placeholder="What needs to be done?" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Assignee</label>
              <select className="form-control" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}>
                <option value="">Unassigned</option>
                {members?.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">↓ Low</option>
                <option value="medium">→ Medium</option>
                <option value="high">↑ High</option>
                <option value="critical">⚡ Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_COLS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" className="form-control" value={form.dueDate ? form.dueDate.split('T')[0] : ''}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input className="form-control" placeholder="frontend, bug, v2" value={typeof form.tags === 'string' ? form.tags : (form.tags || []).join(', ')}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onSave }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { userId, role });
      onSave(res.data);
      toast.success('Member added!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Add Team Member</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>User *</label>
            <select className="form-control" value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">Select a user</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
const getAvatarColor = (name) => {
  const colors = ['#7c6af7','#34d399','#60a5fa','#fbbf24','#f87171','#a78bfa'];
  let hash = 0;
  for (let c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task object
  const [memberModal, setMemberModal] = useState(false);
  const [view, setView] = useState('board'); // board | list

  const load = () => {
    api.get(`/projects/${id}`)
      .then(res => { setProject(res.data.project); setTasks(res.data.tasks); })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const isAdmin = user?.role === 'admin' ||
    project?.owner?._id === user?._id ||
    project?.members?.find(m => m.user?._id === user?._id)?.role === 'admin';

  const handleTaskSave = (savedTask, isEdit) => {
    if (isEdit) {
      setTasks(prev => prev.map(t => t._id === savedTask._id ? savedTask : t));
    } else {
      setTasks(prev => [savedTask, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!project) return null;

  const tasksByStatus = STATUS_COLS.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: project.color + '22', border: `2px solid ${project.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: project.color
          }}>◈</div>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 2 }}>{project.name}</h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{project.description}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {/* Member avatars */}
            <div style={{ display: 'flex', gap: -4 }}>
              {project.members?.slice(0, 4).map(m => (
                <div key={m.user._id} className="avatar" title={m.user.name}
                  style={{ background: getAvatarColor(m.user.name), border: '2px solid var(--bg2)', marginLeft: -6 }}>
                  {getInitials(m.user.name)}
                </div>
              ))}
            </div>
            {isAdmin && (
              <button className="btn btn-secondary btn-sm" onClick={() => setMemberModal(true)}>
                + Member
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>
              + Task
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['board', 'list'].map(v => (
            <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>
              {v === 'board' ? '⊞' : '☰'} {v}
            </button>
          ))}
        </div>
      </div>

      {/* Board view */}
      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto' }}>
          {STATUS_COLS.map(status => (
            <div key={status}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, padding: '6px 0'
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {STATUS_LABELS[status]}
                </span>
                <span style={{
                  background: 'var(--bg3)', color: 'var(--text3)',
                  borderRadius: 20, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600
                }}>{tasksByStatus[status].length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasksByStatus[status].map(task => (
                  <div key={task._id} className="card" style={{ padding: 14, cursor: 'pointer' }}
                    onClick={() => setTaskModal(task)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>
                        {PRIORITY_EMOJI[task.priority]} {task.priority.toUpperCase()}
                      </span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '0.8rem' }}>
                        ✕
                      </button>
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
                    {task.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {task.tags.map(tag => (
                          <span key={tag} style={{ background: 'var(--bg3)', color: 'var(--text2)', padding: '1px 8px', borderRadius: 20, fontSize: '0.7rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {task.assignee ? (
                        <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.65rem', background: getAvatarColor(task.assignee.name) }} title={task.assignee.name}>
                          {getInitials(task.assignee.name)}
                        </div>
                      ) : <span />}
                      {task.dueDate && (
                        <span style={{
                          fontSize: '0.72rem',
                          color: isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'var(--danger)' : 'var(--text3)'
                        }}>
                          📅 {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setTaskModal('new')}>
                  + Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">◻</div>
              <h3>No tasks yet</h3>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setTaskModal('new')}>+ Add Task</button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th><th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} style={{ cursor: 'pointer' }} onClick={() => setTaskModal(task)}>
                    <td><div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{task.description.slice(0, 60)}...</div>}
                    </td>
                    <td>{task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.65rem', background: getAvatarColor(task.assignee.name) }}>{getInitials(task.assignee.name)}</div>
                        <span style={{ fontSize: '0.85rem' }}>{task.assignee.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td><span style={{ color: PRIORITY_COLORS[task.priority], fontWeight: 600, fontSize: '0.85rem' }}>{PRIORITY_EMOJI[task.priority]} {task.priority}</span></td>
                    <td>
                      <select className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        value={task.status} onClick={e => e.stopPropagation()}
                        onChange={e => handleStatusChange(task._id, e.target.value)}>
                        {STATUS_COLS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ color: task.dueDate && isPast(new Date(task.dueDate)) ? 'var(--danger)' : 'var(--text2)', fontSize: '0.85rem' }}>
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Task Modal */}
      {taskModal && (
        <TaskModal
          projectId={id}
          members={project.members}
          task={taskModal === 'new' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
        />
      )}

      {/* Member Modal */}
      {memberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setMemberModal(false)}
          onSave={updatedProject => setProject(updatedProject)}
        />
      )}
    </div>
  );
}
