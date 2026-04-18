/**
 * Assignment Model
 * Represents assignments created by students
 */

const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'late', 'graded'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    marks: {
      total: { type: Number, default: 100 },
      obtained: { type: Number, default: null },
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    submittedAt: { type: Date, default: null },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
