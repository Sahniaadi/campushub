/**
 * Database Seed Script
 * Run: node scripts/seed.js
 * Creates demo users and sample data for testing
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Note = require('../models/Note');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const CGPARecord = require('../models/CGPARecord');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campushub';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean existing data
  await Promise.all([
    User.deleteMany({}), Note.deleteMany({}), Assignment.deleteMany({}),
    Task.deleteMany({}), Post.deleteMany({}), Notification.deleteMany({}),
    CGPARecord.deleteMany({}),
  ]);
  console.log('🗑  Cleared old data');

  // ── Create Users ─────────────────────────────────────────────
  const users = await User.create([
    {
      name: 'Demo Student',
      email: 'demo@campushub.com',
      password: 'demo1234',
      college: 'MIT',
      branch: 'Computer Science',
      semester: 5,
      bio: 'Final year CS student. Love ML and competitive coding.',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@campushub.com',
      password: 'demo1234',
      college: 'IIT Delhi',
      branch: 'Data Science',
      semester: 3,
      bio: 'Data science enthusiast and part-time blogger.',
    },
    {
      name: 'Arjun Patel',
      email: 'arjun@campushub.com',
      password: 'demo1234',
      college: 'BITS Pilani',
      branch: 'Electronics',
      semester: 7,
      bio: 'Electronics & robotics lover.',
    },
  ]);
  console.log(`👤 Created ${users.length} users`);

  const [demo, priya, arjun] = users;

  // ── Create Notes ─────────────────────────────────────────────
  await Note.create([
    { title: 'Data Structures Complete Notes', subject: 'Data Structures', semester: 3, description: 'Arrays, Linked Lists, Trees, Graphs, Heaps.', tags: ['arrays','trees','graphs'], uploadedBy: priya._id, downloads: 42 },
    { title: 'OS Concepts - Process & Memory', subject: 'OS', semester: 4, description: 'Process scheduling, memory management, virtual memory.', tags: ['process','memory','scheduling'], uploadedBy: arjun._id, downloads: 28 },
    { title: 'Machine Learning Fundamentals', subject: 'Machine Learning', semester: 5, description: 'Supervised & unsupervised learning basics.', tags: ['ml','ai','regression'], uploadedBy: demo._id, downloads: 65 },
    { title: 'DBMS - SQL & Normalization', subject: 'DBMS', semester: 4, description: 'SQL queries, joins, normalization forms.', tags: ['sql','normalization','er'], uploadedBy: priya._id, downloads: 33 },
    { title: 'Computer Networks - OSI & TCP/IP', subject: 'Networks', semester: 5, description: 'Network layers, protocols, routing.', tags: ['tcp','ip','osi'], uploadedBy: arjun._id, downloads: 19 },
  ]);
  console.log('📔 Created notes');

  // ── Create Assignments ────────────────────────────────────────
  const now = new Date();
  await Assignment.create([
    { title: 'ML Assignment - Linear Regression', subject: 'Machine Learning', deadline: new Date(now.getTime() + 3*864e5), priority: 'high', status: 'pending',   user: demo._id, description: 'Implement linear regression from scratch.' },
    { title: 'OS Lab - Shell Scripting',          subject: 'OS',               deadline: new Date(now.getTime() + 1*864e5), priority: 'high', status: 'pending',   user: demo._id, description: 'Write a shell script for process management.' },
    { title: 'DBMS Project - ER Diagram',         subject: 'DBMS',             deadline: new Date(now.getTime() + 7*864e5), priority: 'medium', status: 'submitted', submittedAt: new Date(), user: demo._id },
    { title: 'Networks Quiz Preparation',         subject: 'Networks',         deadline: new Date(now.getTime() - 2*864e5), priority: 'medium', status: 'late',    user: demo._id },
    { title: 'Data Structures - BST Implementation', subject: 'Data Structures', deadline: new Date(now.getTime() + 5*864e5), priority: 'low', status: 'pending', user: demo._id },
  ]);
  console.log('📋 Created assignments');

  // ── Create Planner Tasks ──────────────────────────────────────
  const today = new Date(); today.setHours(0,0,0,0);
  await Task.create([
    { title: 'Morning algorithm practice', date: today, time: '08:00', category: 'study',      priority: 'high',   completed: true,  user: demo._id },
    { title: 'Review ML lecture notes',    date: today, time: '10:00', category: 'study',      priority: 'medium', completed: false, user: demo._id },
    { title: 'Complete OS lab assignment', date: today, time: '14:00', category: 'assignment',  priority: 'high',   completed: false, user: demo._id },
    { title: 'Read research paper',        date: today, time: '16:30', category: 'study',      priority: 'low',    completed: false, user: demo._id },
    { title: 'Mock interview prep',        date: new Date(today.getTime() + 864e5), time: '11:00', category: 'personal', priority: 'high', completed: false, user: demo._id },
  ]);
  console.log('📅 Created planner tasks');

  // ── Create CGPA Record ────────────────────────────────────────
  await CGPARecord.create({
    user: demo._id,
    semesters: [
      { semesterNumber: 1, subjects: [
        { subjectName: 'Mathematics I',       credits: 4, grade: 'A+' },
        { subjectName: 'Physics',             credits: 3, grade: 'A'  },
        { subjectName: 'Programming in C',    credits: 4, grade: 'O'  },
        { subjectName: 'English',             credits: 2, grade: 'A'  },
      ]},
      { semesterNumber: 2, subjects: [
        { subjectName: 'Mathematics II',      credits: 4, grade: 'A'  },
        { subjectName: 'Data Structures',     credits: 4, grade: 'A+' },
        { subjectName: 'Digital Electronics', credits: 3, grade: 'B+' },
        { subjectName: 'OOP with Java',       credits: 4, grade: 'A'  },
      ]},
      { semesterNumber: 3, subjects: [
        { subjectName: 'DBMS',                credits: 4, grade: 'A+' },
        { subjectName: 'Operating Systems',   credits: 4, grade: 'A'  },
        { subjectName: 'Computer Networks',   credits: 3, grade: 'B+' },
        { subjectName: 'Algorithms',          credits: 4, grade: 'A'  },
      ]},
    ],
  });
  console.log('🎓 Created CGPA record');

  // ── Create Community Posts ────────────────────────────────────
  const posts = await Post.create([
    {
      title: 'Resources for Machine Learning beginners?',
      content: 'Hey everyone! I am starting my ML journey. Can someone share the best free resources? Books, YouTube channels, or courses — anything helps!',
      category: 'doubt',
      tags: ['ml','beginners','resources'],
      author: demo._id,
      views: 87,
    },
    {
      title: 'Amazing free alternative to Notion for students!',
      content: 'I found this amazing tool called Obsidian for taking notes. It is completely free and works offline! Anyone else using it?',
      category: 'resource',
      tags: ['productivity','notes','tools'],
      author: priya._id,
      views: 234,
    },
    {
      title: 'Campus placement season is starting — Preparation tips?',
      content: 'Final year students, placement season is around the corner. Share your preparation strategy and resources that helped you crack top companies!',
      category: 'placement',
      tags: ['placement','jobs','career'],
      author: arjun._id,
      views: 312,
    },
  ]);

  // Add sample comments
  posts[0].comments.push({ user: priya._id, text: 'Andrew Ng\'s Machine Learning course on Coursera is a great start!' });
  posts[0].comments.push({ user: arjun._id, text: 'Also check fast.ai — very practical and hands-on.' });
  await posts[0].save();
  console.log('💬 Created community posts');

  // ── Create Notifications ──────────────────────────────────────
  await Notification.create([
    { user: demo._id, title: '🎉 Welcome to CampusHub!', message: 'Your account is all set. Explore notes, assignments and AI tools!', type: 'system' },
    { user: demo._id, title: '⚠️ Deadline Tomorrow!',   message: 'OS Lab - Shell Scripting is due tomorrow. Don\'t forget!', type: 'deadline' },
    { user: demo._id, title: '💬 New Comment',          message: 'Priya commented on your ML resources post.', type: 'community' },
    { user: demo._id, title: '📢 Announcement',         message: 'Mid-semester exams begin next week. Plan accordingly!', type: 'announcement' },
  ]);
  console.log('🔔 Created notifications');

  console.log('\n🚀 Seed complete! Demo credentials:');
  console.log('   Email:    demo@campushub.com');
  console.log('   Password: demo1234\n');

  mongoose.disconnect();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
