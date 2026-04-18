const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, createTask, updateTask, toggleTask, deleteTask } = require('../controllers/plannerController');

router.get('/tasks', protect, getTasks);
router.post('/tasks', protect, createTask);
router.put('/tasks/:id', protect, updateTask);
router.put('/tasks/:id/toggle', protect, toggleTask);
router.delete('/tasks/:id', protect, deleteTask);

module.exports = router;
