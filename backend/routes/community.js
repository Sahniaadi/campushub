const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPosts, createPost, addComment, toggleLike, deletePost } = require('../controllers/communityController');

router.get('/posts', protect, getPosts);
router.post('/posts', protect, createPost);
router.post('/posts/:id/comment', protect, addComment);
router.put('/posts/:id/like', protect, toggleLike);
router.delete('/posts/:id', protect, deletePost);

module.exports = router;
