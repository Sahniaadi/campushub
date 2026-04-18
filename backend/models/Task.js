/**
 * Planner Task Model
 * Represents daily tasks in the student planner
 */

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: { type: String, default: '' },
    date: {
      type: Date,
      required: [true, 'Task date is required'],
    },
    time: { type: String, default: '' },  // e.g. "14:30"
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['study', 'assignment', 'exam', 'personal', 'other'],
      default: 'study',
    },
    reminder: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
