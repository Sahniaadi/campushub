const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithAI, summarizeNotes, generateCode, solveDoubt } = require('../controllers/aiController');

router.post('/chat', protect, chatWithAI);
router.post('/summarize', protect, summarizeNotes);
router.post('/generate-code', protect, generateCode);
router.post('/solve-doubt', protect, solveDoubt);

module.exports = router;
