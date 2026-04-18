import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserCircle, Save, Camera, Mail, Building, BookOpen, Edit3, GraduationCap } from 'lucide-react';

const BRANCHES = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Data Science','AI & ML','Other'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', college: '', branch: '', semester: 1, bio: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats]       = useState({ notes: 0, assignments: 0, posts: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, notesRes, assignRes, postsRes] = await Promise.allSettled([
          API.get('/profile'),
          API.get('/notes?limit=1'),
          API.get('/assignments'),
          API.get('/community/posts'),
        ]);

        if (profileRes.status === 'fulfilled') {
          const u = profileRes.value.data.data;
          setForm({ name: u.name||'', email: u.email||'', college: u.college||'', branch: u.branch||'', semester: u.semester||1, bio: u.bio||'' });
        }

        const notes = notesRes.status === 'fulfilled' ? notesRes.value.data.total || 0 : 0;
        const assigns = assignRes.status === 'fulfilled' ? (assignRes.value.data.data||[]).length : 0;
        const myPosts = postsRes.status === 'fulfilled'
          ? (postsRes.value.data.data||[]).filter((p) => p.author?._id === user?._id).length
          : 0;

        setStats({ notes, assignments: assigns, posts: myPosts });
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required.');
    setSaving(true);
    try {
      const { data } = await API.put('/profile', form);
      updateUser(data.data);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div>;

  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
  const initial = (form.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="page-title flex items-center gap-2"><UserCircle size={24} className="text-indigo-600" /> My Profile</h1>
        <p className="page-subtitle">Manage your account and academic details</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left – Avatar + Stats ── */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="card text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-extrabold mx-auto shadow-glow">
                {initial}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{form.name}</h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{form.branch || 'No branch set'}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>

            {form.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center leading-relaxed italic">"{form.bio}"</p>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">My Activity</h3>
            <div className="space-y-3">
              {[
                { label:'Notes Shared',  value: stats.notes,       emoji:'📚' },
                { label:'Assignments',   value: stats.assignments,  emoji:'📋' },
                { label:'Community Posts', value: stats.posts,      emoji:'💬' },
                { label:'Semester',      value: `Sem ${form.semester}`, emoji:'🎓' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{s.emoji} {s.label}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right – Edit Form ── */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white">Account Details</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn-ghost flex items-center gap-1.5 text-sm">
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={save} className="space-y-5">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <UserCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={`input pl-10 ${!editMode ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`} disabled={!editMode} />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.email} className="input pl-10 bg-gray-50 dark:bg-gray-800/50 cursor-default" disabled />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* College */}
              <div>
                <label className="label">College / University</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.college} onChange={(e) => setForm({...form, college: e.target.value})} placeholder="Your college" className={`input pl-10 ${!editMode ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`} disabled={!editMode} />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="label">Current Semester</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={form.semester} onChange={(e) => setForm({...form, semester: Number(e.target.value)})} className={`input pl-10 ${!editMode ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`} disabled={!editMode}>
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="label">Branch / Department</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.branch} onChange={(e) => setForm({...form, branch: e.target.value})} className={`input pl-10 ${!editMode ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`} disabled={!editMode}>
                  <option value="">-- Select Branch --</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="label">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell the community a bit about yourself…" className={`input resize-none ${!editMode ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default' : ''}`} rows={3} disabled={!editMode} maxLength={200} />
              {editMode && <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/200</p>}
            </div>

            {editMode && (
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="spinner w-4 h-4" />Saving…</> : <><Save size={16} />Save Changes</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
