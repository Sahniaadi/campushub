const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAssignments, createAssignment, updateAssignment, submitAssignment, deleteAssignment } = require('../controllers/assignmentController');

router.get('/', protect, getAssignments);
router.post('/', protect, createAssignment);
router.put('/:id', protect, updateAssignment);
router.put('/:id/submit', protect, submitAssignment);
router.delete('/:id', protect, deleteAssignment);

module.exports = router;
