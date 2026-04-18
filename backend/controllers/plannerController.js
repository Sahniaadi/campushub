/**
 * Planner Controller
 * Daily tasks and calendar management
 */

const Task = require('../models/Task');

// ─── @route GET /api/planner/tasks ───────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { date, month, year } = req.query;
    const query = { user: req.user._id };

    if (date) {
      // Get tasks for a specific day
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: day, $lt: nextDay };
    } else if (month && year) {
      // Get tasks for a month
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(query).sort({ date: 1, time: 1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/planner/tasks ──────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/planner/tasks/:id ───────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/planner/tasks/:id/toggle ────────────────────────────────
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    task.completed = !task.completed;
    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route DELETE /api/planner/tasks/:id ────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, toggleTask, deleteTask };
