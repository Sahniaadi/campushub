/**
 * Community Controller
 * Forum posts, comments, and likes
 */

const Post = require('../models/Post');
const Notification = require('../models/Notification');

// ─── @route GET /api/community/posts ─────────────────────────────────────────
const getPosts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name avatar branch')
      .populate('comments.user', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: posts, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/community/posts ────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await Post.create({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      author: req.user._id,
    });
    await post.populate('author', 'name avatar branch');
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/community/posts/:id/comment ────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'name avatar');

    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        title: '💬 New Comment',
        message: `${req.user.name} commented on your post "${post.title}"`,
        type: 'community',
      });
    }

    res.json({ success: true, data: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route PUT /api/community/posts/:id/like ────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();

    res.json({ success: true, likes: post.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route DELETE /api/community/posts/:id ──────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Not found or unauthorized.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPosts, createPost, addComment, toggleLike, deletePost };
