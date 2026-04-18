import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, Building, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Data Science','AI & ML','Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', semester: '1',
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [step, setStep]         = useState(1); // 2-step form

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields.');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md space-y-7 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join CampusHub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create your free student account</p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2">
          {[1,2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>

        <div className="card">
          {step === 1 ? (
            <form onSubmit={nextStep} className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Step 1 — Account Details</h2>

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="name" value={form.name} onChange={handle} placeholder="John Doe" className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@university.edu" className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Min. 6 characters" className="input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Repeat password" className="input pl-10" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3">Continue →</button>
            </form>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Step 2 — Academic Profile</h2>

              <div>
                <label className="label">College / University</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="college" value={form.college} onChange={handle} placeholder="e.g. MIT" className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Branch / Department</label>
                <select name="branch" value={form.branch} onChange={handle} className="input">
                  <option value="">-- Select Branch --</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Current Semester</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="semester" value={form.semester} onChange={handle} className="input pl-10">
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? <span className="flex items-center justify-center gap-2"><div className="spinner w-4 h-4" />Creating…</span> : 'Create Account 🎉'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
