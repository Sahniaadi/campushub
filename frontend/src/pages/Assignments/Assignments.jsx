import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, ClipboardList, X, Check, Trash2, Edit2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const SUBJECTS = ['Mathematics','Physics','Chemistry','Computer Science','Data Structures','Algorithms','DBMS','OS','Networks','Machine Learning','English','Other'];
const PRIORITY_COLORS = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-blue' };
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'badge-yellow', icon: Clock          },
  submitted: { label: 'Submitted', cls: 'badge-green',  icon: CheckCircle2   },
  late:      { label: 'Late',      cls: 'badge-red',    icon: AlertCircle    },
  graded:    { label: 'Graded',    cls: 'badge-purple', icon: CheckCircle2   },
};

const emptyForm = { title: '', description: '', subject: '', deadline: '', priority: 'medium', marks: 100 };

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await API.get(`/assignments${params}`);
      setAssignments(data.data || []);
    } catch { toast.error('Failed to load assignments.'); }
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, [filter]); // eslint-disable-line

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (a)  => { setEditItem(a); setForm({ title: a.title, description: a.description || '', subject: a.subject, deadline: a.deadline?.slice(0,10) || '', priority: a.priority, marks: a.marks?.total || 100 }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.deadline) return toast.error('Fill required fields.');
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await API.put(`/assignments/${editItem._id}`, form);
        setAssignments((prev) => prev.map((a) => a._id === editItem._id ? data.data : a));
        toast.success('Updated!');
      } else {
        const { data } = await API.post('/assignments', form);
        setAssignments((prev) => [data.data, ...prev]);
        toast.success('Assignment created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    setSaving(false);
  };

  const submit = async (id) => {
    try {
      const { data } = await API.put(`/assignments/${id}/submit`);
      setAssignments((prev) => prev.map((a) => a._id === id ? data.data : a));
      toast.success('Marked as submitted! ✅');
    } catch { toast.error('Failed.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await API.delete(`/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const daysLeft = (date, status) => {
    if (status === 'submitted' || status === 'graded') return null;
    const diff = Math.ceil((new Date(date) - new Date()) / 864e5);
    if (diff < 0) return { text: 'Overdue', cls: 'text-red-500' };
    if (diff === 0) return { text: 'Due today', cls: 'text-amber-500 font-bold' };
    return { text: `${diff} day${diff !== 1 ? 's' : ''} left`, cls: diff <= 2 ? 'text-amber-500' : 'text-gray-400' };
  };

  const tabs = ['all','pending','submitted','late','graded'];
  const counts = tabs.reduce((acc, t) => {
    acc[t] = t === 'all' ? assignments.length : assignments.filter(a => a.status === t).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><ClipboardList size={24} className="text-amber-500" /> Assignments</h1>
          <p className="page-subtitle">Track your deadlines and submissions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
            ${filter === t ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${filter === t ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-50 dark:bg-gray-800" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No assignments found</p>
          <button onClick={openCreate} className="btn-primary mt-4 mx-auto inline-flex gap-2"><Plus size={16} />Add Assignment</button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            const dl = daysLeft(a.deadline, a.status);
            return (
              <div key={a._id} className="card hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Priority stripe */}
                <div className={`w-1.5 h-full min-h-[4rem] rounded-full flex-shrink-0 ${a.priority === 'high' ? 'bg-red-400' : a.priority === 'low' ? 'bg-blue-400' : 'bg-amber-400'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                    <span className={sc.cls}><StatusIcon size={10} className="inline mr-1" />{sc.label}</span>
                    <span className={PRIORITY_COLORS[a.priority]}>{a.priority}</span>
                  </div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{a.subject}</p>
                  {a.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span>📅 {new Date(a.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                    {dl && <span className={dl.cls}>{dl.text}</span>}
                    <span>📊 Marks: {a.marks?.total || 100}</span>
                    {a.submittedAt && <span>✅ Submitted {new Date(a.submittedAt).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.status === 'pending' && (
                    <button onClick={() => submit(a._id)} className="btn-secondary text-xs py-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Check size={14} /> Submit
                    </button>
                  )}
                  <button onClick={() => openEdit(a)} className="btn-ghost p-2"><Edit2 size={15} /></button>
                  <button onClick={() => remove(a._id)} className="btn-ghost p-2 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{editItem ? 'Edit Assignment' : 'New Assignment'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Assignment name" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="input">
                    <option value="">Select…</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Deadline *</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="input" min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Total Marks</label>
                  <input type="number" value={form.marks} onChange={(e) => setForm({...form, marks: e.target.value})} className="input" min="0" max="1000" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Assignment details…" className="input resize-none" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="spinner w-4 h-4" />Saving…</> : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
