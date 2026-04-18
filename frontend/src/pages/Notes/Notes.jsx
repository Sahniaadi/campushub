import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Search, Download, Trash2, FileText, BookOpen,
  X, Upload, Filter, Eye, Heart
} from 'lucide-react';

const FILE_ICONS = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊', txt: '📃' };
const SUBJECTS = ['Mathematics','Physics','Chemistry','Computer Science','Data Structures','Algorithms','DBMS','OS','Networks','Machine Learning','English','Other'];

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [subject, setSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', semester: user?.semester || 1, tags: '', file: null });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)  params.append('search', search);
      if (subject) params.append('subject', subject);
      const { data } = await API.get(`/notes?${params}`);
      setNotes(data.data || []);
    } catch { toast.error('Failed to load notes.'); }
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [search, subject]); // eslint-disable-line

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject) return toast.error('Title and subject required.');
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'file' && v) fd.append(k, v); });
      if (form.file) fd.append('file', form.file);
      await API.post('/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded!');
      setShowModal(false);
      setForm({ title: '', description: '', subject: '', semester: user?.semester || 1, tags: '', file: null });
      fetchNotes();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed.'); }
    setUploading(false);
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success('Note deleted.');
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch { toast.error('Delete failed.'); }
  };

  const handleDownload = async (note) => {
    await API.put(`/notes/${note._id}/download`);
    if (note.fileUrl) window.open(`${process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000'}${note.fileUrl}`, '_blank');
  };

  const formatSize = (bytes) => bytes ? `${(bytes / 1024).toFixed(0)} KB` : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><BookOpen size={24} className="text-indigo-600" /> Notes Library</h1>
          <p className="page-subtitle">Browse and share study materials</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Upload Note
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="input pl-10 py-2.5" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input py-2.5">
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(search || subject) && (
          <button onClick={() => { setSearch(''); setSubject(''); }} className="btn-ghost flex items-center gap-1 text-sm">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse h-48">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 card">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notes found.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to upload study materials!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4 mx-auto inline-flex gap-2">
            <Plus size={16} /> Upload First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              {/* File type badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{FILE_ICONS[note.fileType] || '📁'}</span>
                <span className="badge-blue">{note.fileType?.toUpperCase() || 'NOTE'}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{note.title}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">{note.subject}</p>
              {note.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{note.description}</p>}

              {/* Tags */}
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full px-2 py-0.5">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span>Sem {note.semester}</span>
                <span>•</span>
                <span>{note.downloads || 0} downloads</span>
                {note.fileSize && <><span>•</span><span>{formatSize(note.fileSize)}</span></>}
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {note.uploadedBy?.name?.charAt(0) || '?'}
                </div>
                <span className="text-xs text-gray-500">{note.uploadedBy?.name || 'Unknown'}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {note.fileUrl && (
                  <button onClick={() => handleDownload(note)} className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5">
                    <Download size={13} /> Download
                  </button>
                )}
                {note.uploadedBy?._id === user?._id && (
                  <button onClick={() => deleteNote(note._id)} className="btn-ghost p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Upload Note</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Data Structures Notes" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="input">
                    <option value="">Select...</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Semester</label>
                  <select value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})} className="input">
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Brief description…" className="input resize-none" rows={2} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="e.g. arrays, sorting, trees" className="input" />
              </div>
              <div>
                <label className="label">File (PDF, DOC, PPT, TXT)</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => document.getElementById('note-file').click()}>
                  {form.file ? (
                    <p className="text-sm text-indigo-600 font-medium">{form.file.name}</p>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-sm text-gray-400">Click to select file (max 10MB)</p>
                    </>
                  )}
                </div>
                <input id="note-file" type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => setForm({...form, file: e.target.files[0]})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {uploading ? <><div className="spinner w-4 h-4" />Uploading…</> : <><Upload size={16} />Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
