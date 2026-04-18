import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  BookOpen, ClipboardList, Bot, CalendarDays, Calculator,
  Users, TrendingUp, Clock, CheckCircle, AlertCircle, Zap
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div onClick={onClick} className={`card-hover flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''}`}>
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, desc, color, onClick }) => (
  <button onClick={onClick} className="card-hover text-left w-full group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState({ notes: 0, pending: 0, submitted: 0, tasks: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [notesRes, assignRes, tasksRes] = await Promise.allSettled([
          API.get('/notes?limit=1'),
          API.get('/assignments'),
          API.get(`/planner/tasks?date=${today}`),
        ]);

        const notes   = notesRes.status === 'fulfilled' ? notesRes.value.data.total || 0 : 0;
        const assigns = assignRes.status === 'fulfilled' ? assignRes.value.data.data || [] : [];
        const tasks   = tasksRes.status === 'fulfilled' ? tasksRes.value.data.data || [] : [];

        const pending   = assigns.filter((a) => a.status === 'pending' || a.status === 'late').length;
        const submitted = assigns.filter((a) => a.status === 'submitted').length;

        // Upcoming deadlines (next 7 days)
        const soon = assigns
          .filter((a) => a.status === 'pending')
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 4);

        setStats({ notes, pending, submitted, tasks: tasks.length });
        setUpcoming(soon);
        setTodayTasks(tasks.slice(0, 5));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const daysLeft = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: 'Overdue', cls: 'badge-red' };
    if (diff === 0) return { text: 'Due today', cls: 'badge-yellow' };
    if (diff <= 2) return { text: `${diff}d left`, cls: 'badge-yellow' };
    return { text: `${diff}d left`, cls: 'badge-blue' };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-10 h-10" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Hero greeting ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-violet-400/20 rounded-full translate-y-1/2 blur-2xl" />
        <div className="relative z-10">
          <p className="text-indigo-200 font-medium">{greeting} 👋</p>
          <h1 className="text-3xl font-bold mt-1">{user?.name}</h1>
          <p className="text-indigo-200 mt-1 text-sm">
            {user?.branch && `${user.branch} • `}Semester {user?.semester || '–'} • {user?.college || 'CampusHub'}
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => navigate('/ai-tools')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all">
              <Zap size={15} /> Ask AI
            </button>
            <button onClick={() => navigate('/notes')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              📚 Browse Notes
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}     label="Total Notes"      value={stats.notes}     color="bg-gradient-to-br from-blue-500 to-cyan-500"    onClick={() => navigate('/notes')} />
        <StatCard icon={AlertCircle}  label="Pending Tasks"    value={stats.pending}   color="bg-gradient-to-br from-amber-500 to-orange-500" onClick={() => navigate('/assignments')} />
        <StatCard icon={CheckCircle}  label="Submitted"        value={stats.submitted} color="bg-gradient-to-br from-emerald-500 to-green-500" onClick={() => navigate('/assignments')} />
        <StatCard icon={CalendarDays} label="Today's Tasks"    value={stats.tasks}     color="bg-gradient-to-br from-violet-500 to-purple-600" onClick={() => navigate('/planner')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Upcoming Deadlines ── */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Upcoming Deadlines
            </h2>
            <button onClick={() => navigate('/assignments')} className="btn-ghost text-xs">View all →</button>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
              <p className="font-medium">No pending deadlines!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const dl = daysLeft(a.deadline);
                return (
                  <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-2 h-10 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.subject} • Due {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span className={dl.cls}>{dl.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Today's Tasks ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={18} className="text-indigo-500" /> Today
            </h2>
            <button onClick={() => navigate('/planner')} className="btn-ghost text-xs">Planner →</button>
          </div>
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">🎯</p>
              <p className="text-sm">No tasks today! Relax or plan ahead.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((t) => (
                <div key={t._id} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`text-sm ${t.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickAction icon={BookOpen}     label="Upload Note"   desc="Share with peers"    color="bg-gradient-to-br from-blue-500 to-cyan-500"    onClick={() => navigate('/notes')} />
          <QuickAction icon={ClipboardList} label="Add Task"     desc="Track assignment"   color="bg-gradient-to-br from-amber-500 to-orange-500" onClick={() => navigate('/assignments')} />
          <QuickAction icon={Bot}          label="Ask AI"        desc="Get smart help"     color="bg-gradient-to-br from-violet-500 to-purple-600" onClick={() => navigate('/ai-tools')} />
          <QuickAction icon={CalendarDays} label="Plan Day"      desc="Schedule tasks"     color="bg-gradient-to-br from-pink-500 to-rose-500"    onClick={() => navigate('/planner')} />
          <QuickAction icon={Calculator}   label="Calc CGPA"     desc="Track grades"       color="bg-gradient-to-br from-emerald-500 to-teal-500"  onClick={() => navigate('/cgpa')} />
          <QuickAction icon={Users}        label="Community"     desc="Ask questions"      color="bg-gradient-to-br from-indigo-500 to-blue-500"   onClick={() => navigate('/community')} />
        </div>
      </div>
    </div>
  );
}
