const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

exports.projectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id || req.body.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const memberEntry = project.members.find(m => m.user.toString() === req.user._id.toString());
    const isProjectAdmin = memberEntry && memberEntry.role === 'admin';
    const isGlobalAdmin = req.user.role === 'admin';

    if (!isOwner && !isProjectAdmin && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Project admin access required' });
    }

    req.project = project;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
