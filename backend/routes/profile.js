const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.put('/', protect, upload.single('avatar'), updateProfile);

module.exports = router;
