const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCGPA, addOrUpdateSemester, deleteSemester } = require('../controllers/cgpaController');

router.get('/', protect, getCGPA);
router.post('/semester', protect, addOrUpdateSemester);
router.delete('/semester/:num', protect, deleteSemester);

module.exports = router;
