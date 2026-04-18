/**
 * Notes Controller
 * CRUD operations for study notes
 */

const Note = require('../models/Note');
const Notification = require('../models/Notification');
const path = require('path');

// ─── @route GET /api/notes ───────────────────────────────────────────────────
const getNotes = async (req, res) => {
  try {
    const { search, subject, semester, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (semester) query.semester = Number(semester);

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: notes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/notes ──────────────────────────────────────────────────
const createNote = async (req, res) => {
  try {
    const { title, description, subject, semester, tags } = req.body;
    const noteData = {
      title,
      description,
      subject,
      semester: Number(semester),
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      uploadedBy: req.user._id,
    };

    // If a file was uploaded via multer
    if (req.file) {
      noteData.fileUrl = `/uploads/${req.file.filename}`;
      noteData.fileName = req.file.originalname;
      noteData.fileSize = req.file.size;
      const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      noteData.fileType = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'].includes(ext) ? ext : 'other';
    }

    const note = await Note.create(noteData);
    await note.populate('uploadedBy', 'name avatar');

    res.status(201).json({ success: true, message: 'Note uploaded!', data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route GET /api/notes/:id ───────────────────────────────────────────────
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name avatar');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route DELETE /api/notes/:id ───────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/notes/:id/download ─────────────────────────────────────
const incrementDownload = async (req, res) => {
  try {
    await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotes, createNote, getNoteById, deleteNote, incrementDownload };
