/**
 * CGPA Controller
 * Calculate and manage semester-wise CGPA
 */

const CGPARecord = require('../models/CGPARecord');

// ─── @route GET /api/cgpa ─────────────────────────────────────────────────────
const getCGPA = async (req, res) => {
  try {
    let record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) {
      record = await CGPARecord.create({ user: req.user._id, semesters: [] });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/cgpa/semester ──────────────────────────────────────────
const addOrUpdateSemester = async (req, res) => {
  try {
    const { semesterNumber, subjects } = req.body;
    let record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) record = new CGPARecord({ user: req.user._id, semesters: [] });

    // Remove existing semester if present, then add new one
    record.semesters = record.semesters.filter((s) => s.semesterNumber !== semesterNumber);
    record.semesters.push({ semesterNumber, subjects });
    record.semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);

    await record.save(); // Pre-save hook calculates SGPA and CGPA
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route DELETE /api/cgpa/semester/:num ───────────────────────────────────
const deleteSemester = async (req, res) => {
  try {
    const record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'No record found.' });
    record.semesters = record.semesters.filter((s) => s.semesterNumber !== Number(req.params.num));
    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCGPA, addOrUpdateSemester, deleteSemester };
