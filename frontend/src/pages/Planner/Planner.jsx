import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { CalendarDays, Plus, Check, Trash2, X, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';

const CATEGORIES = ['study','assignment','exam','personal','other'];
const PRIORITIES  = ['low','medium','high'];
const CAT_COLORS  = { study:'bg-blue-500', assignment:'bg-amber-500', exam:'bg-red-500', personal:'bg-purple-500', other:'bg-gray-500' };
const PRI_COLORS  = { high:'text-red-500', medium:'text-amber-500', low:'text-blue-400' };

const emptyTask = { title: '', description: '', date: format(new Date(),'yyyy-MM-dd'), time: '', priority: 'medium', category: 'study', reminder: false };

export default function Planner() {
  const [tasks, setTasks]         = useState([]);
  const [month, setMonth]         = useState(new Date());
  const [selected, setSelected]   = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState(emptyTask);

  // Fetch tasks for the whole month
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/planner/tasks?month=${month.getMonth()+1}&year=${month.getFullYear()}`);
        setTasks(data.data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [month]);

  // Calendar helpers
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startOffset = getDay(startOfMonth(month)); // 0=Sun
  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const tasksForDay = (day) => tasks.filter((t) => isSameDay(new Date(t.date), day));
  const selectedDayTasks = tasksForDay(selected);

  const openCreate = () => {
    setForm({ ...emptyTask, date: format(selected, 'yyyy-MM-dd') });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Task title required.');
    try {
      const { data } = await API.post('/planner/tasks', form);
      setTasks((prev) => [...prev, data.data]);
      setShowModal(false);
      toast.success('Task added!');
    } catch { toast.error('Failed to save.'); }
  };

  const toggle = async (id) => {
    try {
      const { data } = await API.put(`/planner/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => t._id === id ? data.data : t));
    } catch {}
  };

  const remove = async (id) => {
    try {
      await API.delete(`/planner/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted.');
    } catch {}
  };

  const completedCount = selectedDayTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="page-title flex items-center gap-2"><CalendarDays size={24} className="text-pink-500" /> Student Planner</h1>
        <p className="page-subtitle">Organize your daily schedule and tasks</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Calendar ── */}
        <div className="lg:col-span-3 card">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setMonth(subMonths(month, 1))} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{format(month, 'MMMM yyyy')}</h2>
            <button onClick={() => setMonth(addMonths(month, 1))} className="btn-ghost p-2"><ChevronRight size={18} /></button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {[...Array(startOffset)].map((_, i) => <div key={`empty-${i}`} />)}

            {days.map((day) => {
              const dayTasks = tasksForDay(day);
              const isSelected = isSameDay(day, selected);
              const todayDay = isToday(day);
              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelected(day)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 relative
                    ${isSelected ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-glow-sm' :
                      todayDay ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' :
                      'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  {format(day,'d')}
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayTasks.slice(0,3).map((t,i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : CAT_COLORS[t.category] || 'bg-gray-400'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {CATEGORIES.map((c) => (
              <div key={c} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${CAT_COLORS[c]}`} />
                {c.charAt(0).toUpperCase()+c.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Day Tasks Panel ── */}
        <div className="lg:col-span-2 card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{format(selected, 'EEEE, MMM d')}</h2>
              {selectedDayTasks.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{completedCount}/{selectedDayTasks.length} completed</p>
              )}
            </div>
            <button onClick={openCreate} className="btn-primary py-2 px-3 text-sm flex items-center gap-1.5">
              <Plus size={15} /> Add
            </button>
          </div>

          {/* Progress bar */}
          {selectedDayTasks.length > 0 && (
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-4">
              <div
                className="bg-gradient-to-r from-indigo-600 to-violet-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / selectedDayTasks.length) * 100}%` }}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-32"><div className="spinner w-8 h-8" /></div>
            ) : selectedDayTasks.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays size={36} className="mx-auto text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">No tasks for this day</p>
                <button onClick={openCreate} className="btn-ghost text-xs mt-2"><Plus size={12} className="inline mr-1" />Add task</button>
              </div>
            ) : (
              selectedDayTasks
                .sort((a,b) => a.time?.localeCompare(b.time || '') || 0)
                .map((t) => (
                  <div key={t._id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${t.completed ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
                    <button onClick={() => toggle(t._id)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}>
                      {t.completed && <Check size={11} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${CAT_COLORS[t.category]}`} />
                        <span className="text-xs text-gray-400">{t.category}</span>
                        {t.time && <span className="text-xs text-gray-400">• {t.time}</span>}
                        <span className={`text-xs font-medium ${PRI_COLORS[t.priority]}`}>{t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'}</span>
                      </div>
                    </div>
                    <button onClick={() => remove(t._id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Add Task</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="label">Task Title *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="What do you need to do?" className="input" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Optional details…" className="input resize-none" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
