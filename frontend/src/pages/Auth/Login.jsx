import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const demo = async () => {
    setForm({ email: 'demo@campushub.com', password: 'demo1234' });
    setLoading(true);
    try {
      await login('demo@campushub.com', 'demo1234');
      navigate('/dashboard');
    } catch {
      toast.error('Demo account not set up. Register first or run seed script.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 bg-violet-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 text-center text-white space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto shadow-xl backdrop-blur-sm">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold">CampusHub</h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Your all-in-one student platform for notes, assignments, AI tools, and more.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {['📚 Smart Notes','📋 Assignments','🤖 AI Tools','📅 Planner','🎓 CGPA Calc','👥 Community'].map((f) => (
              <div key={f} className="bg-white/10 rounded-xl px-3 py-2 text-center backdrop-blur-sm">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CampusHub</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handle}
                  placeholder="you@university.edu"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password" name="password" type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="spinner w-4 h-4" />Signing in…</span> : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="divider" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-gray-50 dark:bg-gray-950 px-3 text-xs text-gray-400">or</span>
          </div>

          <button onClick={demo} className="btn-secondary w-full py-3 text-center">
            🚀 Continue with Demo Account
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
