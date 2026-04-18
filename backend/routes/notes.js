const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getNotes, createNote, getNoteById, deleteNote, incrementDownload } = require('../controllers/notesController');

router.get('/', protect, getNotes);
router.post('/', protect, upload.single('file'), createNote);
router.get('/:id', protect, getNoteById);
router.delete('/:id', protect, deleteNote);
router.put('/:id/download', protect, incrementDownload);

module.exports = router;
