import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Calculator, Plus, Trash2, Edit2, X, TrendingUp, Award, BookOpen } from 'lucide-react';

const GRADE_POINTS  = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, D: 4, F: 0 };
const GRADES        = Object.keys(GRADE_POINTS);
const CREDIT_OPTIONS = [1,2,3,4,5,6];
const emptySubject  = { subjectName: '', credits: 3, grade: 'A' };

const getGPAClass = (gpa) => {
  if (gpa >= 9)  return 'text-emerald-500';
  if (gpa >= 7)  return 'text-blue-500';
  if (gpa >= 5)  return 'text-amber-500';
  return 'text-red-500';
};

const getPerformanceLabel = (cgpa) => {
  if (cgpa >= 9.5) return { label: 'Outstanding 🏆', cls: 'badge-green' };
  if (cgpa >= 9)   return { label: 'Excellent 🌟',   cls: 'badge-green' };
  if (cgpa >= 8)   return { label: 'Very Good 🎯',   cls: 'badge-blue'  };
  if (cgpa >= 7)   return { label: 'Good 👍',        cls: 'badge-blue'  };
  if (cgpa >= 5)   return { label: 'Average 📖',     cls: 'badge-yellow' };
  if (cgpa >= 4)   return { label: 'Pass ✅',         cls: 'badge-yellow' };
  return { label: 'Needs Improvement 📚', cls: 'badge-red' };
};

export default function CGPACalculator() {
  const [record, setRecord]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [semModal, setSemModal]   = useState(false);
  const [semNum, setSemNum]       = useState(1);
  const [subjects, setSubjects]   = useState([{ ...emptySubject }]);
  const [saving, setSaving]       = useState(false);
  const [editSem, setEditSem]     = useState(null);

  const fetchCGPA = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/cgpa');
      setRecord(data.data);
    } catch { toast.error('Failed to load CGPA data.'); }
    setLoading(false);
  };

  useEffect(() => { fetchCGPA(); }, []);

  const openAdd = () => {
    const existingNums = record?.semesters?.map((s) => s.semesterNumber) || [];
    const next = [1,2,3,4,5,6,7,8].find((n) => !existingNums.includes(n)) || 1;
    setSemNum(next);
    setSubjects([{ ...emptySubject }]);
    setEditSem(null);
    setSemModal(true);
  };

  const openEdit = (sem) => {
    setSemNum(sem.semesterNumber);
    setSubjects(sem.subjects.map((s) => ({ subjectName: s.subjectName, credits: s.credits, grade: s.grade })));
    setEditSem(sem.semesterNumber);
    setSemModal(true);
  };

  const addSubjectRow = () => setSubjects((prev) => [...prev, { ...emptySubject }]);
  const removeSubjectRow = (i) => setSubjects((prev) => prev.filter((_, idx) => idx !== i));
  const updateSubject = (i, key, val) => setSubjects((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  // Live SGPA preview
  const previewSGPA = () => {
    let tc = 0, tw = 0;
    subjects.forEach(({ credits, grade }) => {
      const c = Number(credits), gp = GRADE_POINTS[grade] ?? 0;
      tc += c; tw += c * gp;
    });
    return tc > 0 ? (tw / tc).toFixed(2) : '–';
  };

  const save = async (e) => {
    e.preventDefault();
    for (const s of subjects) {
      if (!s.subjectName.trim()) return toast.error('Fill all subject names.');
    }
    setSaving(true);
    try {
      const { data } = await API.post('/cgpa/semester', { semesterNumber: semNum, subjects });
      setRecord(data.data);
      setSemModal(false);
      toast.success(`Semester ${semNum} saved!`);
    } catch { toast.error('Failed to save.'); }
    setSaving(false);
  };

  const deleteSem = async (num) => {
    if (!window.confirm(`Delete Semester ${num} data?`)) return;
    try {
      const { data } = await API.delete(`/cgpa/semester/${num}`);
      setRecord(data.data);
      toast.success('Semester deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div>;

  const perf = record?.cgpa ? getPerformanceLabel(record.cgpa) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><Calculator size={24} className="text-emerald-600" /> CGPA Calculator</h1>
          <p className="page-subtitle">Track your academic performance semester by semester</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Semester</button>
      </div>

      {/* CGPA display */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 card flex flex-col items-center justify-center py-8 bg-gradient-to-br from-indigo-600 to-violet-700 border-0">
          <p className="text-indigo-200 text-sm font-medium mb-2">Overall CGPA</p>
          <p className={`text-6xl font-extrabold text-white`}>{record?.cgpa?.toFixed(2) || '–'}</p>
          <p className="text-indigo-200 text-xs mt-2">out of 10.0</p>
          {perf && <span className="mt-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{perf.label}</span>}
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-4">
          <div className="card text-center">
            <BookOpen size={24} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{record?.semesters?.length || 0}</p>
            <p className="text-sm text-gray-500">Semesters Added</p>
          </div>
          <div className="card text-center">
            <TrendingUp size={24} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {record?.semesters?.reduce((acc, s) => acc + s.subjects.length, 0) || 0}
            </p>
            <p className="text-sm text-gray-500">Total Subjects</p>
          </div>
          <div className="card text-center">
            <Award size={24} className="mx-auto text-violet-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {record?.semesters?.length > 0 ? Math.max(...record.semesters.map(s => s.sgpa || 0)).toFixed(2) : '–'}
            </p>
            <p className="text-sm text-gray-500">Best SGPA</p>
          </div>
          <div className="card text-center">
            <Calculator size={24} className="mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {record?.semesters?.reduce((acc, s) => acc + s.subjects.reduce((a, sub) => a + sub.credits, 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-500">Total Credits</p>
          </div>
        </div>
      </div>

      {/* Semesters */}
      {(!record?.semesters || record.semesters.length === 0) ? (
        <div className="card text-center py-16">
          <Calculator size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-500">No semester data yet</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto inline-flex gap-2"><Plus size={16} />Add First Semester</button>
        </div>
      ) : (
        <div className="space-y-4">
          {record.semesters.map((sem) => (
            <div key={sem.semesterNumber} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    S{sem.semesterNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Semester {sem.semesterNumber}</h3>
                    <p className="text-xs text-gray-400">{sem.subjects.length} subjects</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-2xl font-extrabold ${getGPAClass(sem.sgpa)}`}>{sem.sgpa?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">SGPA</p>
                  </div>
                  <button onClick={() => openEdit(sem)} className="btn-ghost p-2"><Edit2 size={15} /></button>
                  <button onClick={() => deleteSem(sem.semesterNumber)} className="btn-ghost p-2 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left pb-2 font-semibold">Subject</th>
                      <th className="text-center pb-2 font-semibold">Credits</th>
                      <th className="text-center pb-2 font-semibold">Grade</th>
                      <th className="text-center pb-2 font-semibold">Points</th>
                      <th className="text-center pb-2 font-semibold">Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="py-2 font-medium text-gray-800 dark:text-gray-200">{sub.subjectName}</td>
                        <td className="py-2 text-center text-gray-500">{sub.credits}</td>
                        <td className="py-2 text-center">
                          <span className={`badge ${sub.grade === 'O' || sub.grade === 'A+' ? 'badge-green' : sub.grade === 'F' ? 'badge-red' : 'badge-blue'}`}>{sub.grade}</span>
                        </td>
                        <td className="py-2 text-center text-gray-500">{sub.gradePoints ?? GRADE_POINTS[sub.grade]}</td>
                        <td className="py-2 text-center text-gray-500">{((sub.gradePoints ?? GRADE_POINTS[sub.grade]) * sub.credits).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {semModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSemModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editSem ? 'Edit' : 'Add'} Semester</h2>
                <p className="text-sm text-gray-400">Preview SGPA: <span className="font-bold text-indigo-600">{previewSGPA()}</span></p>
              </div>
              <button onClick={() => setSemModal(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="label">Semester Number</label>
                  <select value={semNum} onChange={(e) => setSemNum(Number(e.target.value))} className="input">
                    {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Subjects</label>
                    <button type="button" onClick={addSubjectRow} className="btn-ghost text-xs py-1 flex items-center gap-1"><Plus size={13} />Add Row</button>
                  </div>
                  <div className="space-y-2">
                    {subjects.map((sub, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <input value={sub.subjectName} onChange={(e) => updateSubject(i,'subjectName',e.target.value)} placeholder="Subject name" className="input col-span-5 py-2" />
                        <select value={sub.credits} onChange={(e) => updateSubject(i,'credits',Number(e.target.value))} className="input col-span-2 py-2">
                          {CREDIT_OPTIONS.map((c) => <option key={c} value={c}>{c} cr</option>)}
                        </select>
                        <select value={sub.grade} onChange={(e) => updateSubject(i,'grade',e.target.value)} className="input col-span-3 py-2">
                          {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
                        </select>
                        <button type="button" onClick={() => removeSubjectRow(i)} disabled={subjects.length === 1} className="col-span-2 btn-ghost p-2 text-red-400 hover:text-red-600 disabled:opacity-30 justify-center flex">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                <button type="button" onClick={() => setSemModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="spinner w-4 h-4" />Saving…</> : 'Save Semester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
