/**
 * Assignment Controller
 * Manage student assignments with deadlines and status
 */

const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');

// ─── @route GET /api/assignments ─────────────────────────────────────────────
const getAssignments = async (req, res) => {
  try {
    const { status, subject } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (subject) query.subject = { $regex: subject, $options: 'i' };

    const assignments = await Assignment.find(query).sort({ deadline: 1 });

    // Auto-mark overdue assignments as late
    const now = new Date();
    for (const a of assignments) {
      if (a.status === 'pending' && new Date(a.deadline) < now) {
        a.status = 'late';
        await a.save();
      }
    }

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/assignments ────────────────────────────────────────────
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, deadline, priority, marks } = req.body;
    const assignment = await Assignment.create({
      title, description, subject,
      deadline: new Date(deadline),
      priority,
      marks: marks || { total: 100 },
      user: req.user._id,
    });

    // Create deadline notification
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      await Notification.create({
        user: req.user._id,
        title: '⚠️ Deadline Soon!',
        message: `"${title}" is due in ${daysLeft} day(s).`,
        type: 'deadline',
      });
    }

    res.status(201).json({ success: true, message: 'Assignment created!', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/assignments/:id ─────────────────────────────────────────
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/assignments/:id/submit ──────────────────────────────────
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'submitted', submittedAt: new Date() },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Submitted!', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route DELETE /api/assignments/:id ──────────────────────────────────────
const deleteAssignment = async (req, res) => {
  try {
    const a = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!a) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAssignments, createAssignment, updateAssignment, submitAssignment, deleteAssignment };
