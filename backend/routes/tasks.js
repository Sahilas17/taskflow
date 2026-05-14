const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

// Helper: check project access
const checkProjectAccess = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);
  if (!project) return { allowed: false, reason: 'Project not found', project: null };
  if (userRole === 'admin') return { allowed: true, project };
  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some(m => m.user.toString() === userId.toString());
  return { allowed: isOwner || isMember, project };
};

// GET /api/tasks/dashboard - dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    let projectQuery = req.user.role === 'admin'
      ? {} : { $or: [{ owner: userId }, { 'members.user': userId }] };
    
    const projects = await Project.find(projectQuery).select('_id');
    const projectIds = projects.map(p => p._id);

    const [total, myTasks, overdue, byStatus] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, assignee: userId }),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'done' }
      }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .sort('-updatedAt')
      .limit(10);

    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    })
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .limit(5);

    res.json({ total, myTasks, overdue, byStatus, recentTasks, overdueTasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tasks?projectId=...
router.get('/', async (req, res) => {
  try {
    const { projectId, status, assignee, priority } = req.query;
    const filter = {};

    if (projectId) {
      const { allowed } = await checkProjectAccess(projectId, req.user._id, req.user.role);
      if (!allowed) return res.status(403).json({ message: 'Access denied' });
      filter.project = projectId;
    }

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color')
      .sort('-createdAt');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('project').notEmpty().withMessage('Project required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, project, assignee, status, priority, dueDate, tags } = req.body;

    const { allowed } = await checkProjectAccess(project, req.user._id, req.user.role);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.create({
      title, description, project, assignee, status, priority, dueDate, tags,
      createdBy: req.user._id
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { allowed } = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    const { title, description, assignee, status, priority, dueDate, tags } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignee, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ author: req.user._id, text: req.body.text });
    await task.save();
    await task.populate('comments.author', 'name email');

    res.json(task.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { allowed } = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
