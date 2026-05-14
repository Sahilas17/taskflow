const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, projectAdmin } = require('../middleware/auth');

// All routes require auth
router.use(protect);

// GET /api/projects - get all accessible projects
router.get('/', async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] };

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort('-createdAt');

    // Add task counts
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      const completedCount = await Task.countDocuments({ project: p._id, status: 'done' });
      return { ...p.toObject(), taskCount, completedCount };
    }));

    res.json(projectsWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - create project
router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, description, dueDate, color } = req.body;
    const project = await Project.create({
      name,
      description,
      dueDate,
      color: color || '#6366f1',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check access
    const hasAccess = req.user.role === 'admin' ||
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({ project, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id
router.put('/:id', projectAdmin, [
  body('name').optional().trim().notEmpty(),
], async (req, res) => {
  try {
    const { name, description, status, dueDate, color } = req.body;
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, dueDate, color },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members.user', 'name email');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/members - add member
router.post('/:id/members', projectAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = req.project;

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User already a member' });

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', projectAdmin, async (req, res) => {
  try {
    const project = req.project;
    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', projectAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
