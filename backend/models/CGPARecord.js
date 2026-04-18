/**
 * CGPA Record Model
 * Stores semester-wise grade records for CGPA calculation
 */

const mongoose = require('mongoose');

const SubjectGradeSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  grade: {
    type: String,
    required: true,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
  },
  gradePoints: { type: Number }, // auto-calculated
});

const SemesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  subjects: [SubjectGradeSchema],
  sgpa: { type: Number, default: 0 },  // Semester GPA
});

const CGPARecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    semesters: [SemesterSchema],
    cgpa: { type: Number, default: 0 }, // Overall CGPA
  },
  { timestamps: true }
);

// Grade point mapping
const gradePointMap = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, D: 4, F: 0 };

// Pre-save hook to auto-calculate SGPA and CGPA
CGPARecordSchema.pre('save', function (next) {
  let totalCredits = 0;
  let totalWeightedPoints = 0;

  this.semesters.forEach((sem) => {
    let semCredits = 0;
    let semWeighted = 0;

    sem.subjects.forEach((sub) => {
      const gp = gradePointMap[sub.grade] || 0;
      sub.gradePoints = gp;
      semCredits += sub.credits;
      semWeighted += gp * sub.credits;
    });

    sem.sgpa = semCredits > 0 ? parseFloat((semWeighted / semCredits).toFixed(2)) : 0;
    totalCredits += semCredits;
    totalWeightedPoints += semWeighted;
  });

  this.cgpa = totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  next();
});

module.exports = mongoose.model('CGPARecord', CGPARecordSchema);
