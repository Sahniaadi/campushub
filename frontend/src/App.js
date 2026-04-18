import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';

// Pages
import Login       from './pages/Auth/Login';
import Register    from './pages/Auth/Register';
import Dashboard   from './pages/Dashboard/Dashboard';
import Notes       from './pages/Notes/Notes';
import Assignments from './pages/Assignments/Assignments';
import AITools     from './pages/AI/AITools';
import Planner     from './pages/Planner/Planner';
import CGPACalculator from './pages/CGPA/CGPACalculator';
import Community   from './pages/Community/Community';
import Profile     from './pages/Profile/Profile';

// Guard: redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center space-y-4">
        <div className="spinner w-12 h-12 mx-auto" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading CampusHub…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Guard: redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes wrapped in Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="notes"      element={<Notes />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="ai-tools"   element={<AITools />} />
        <Route path="planner"    element={<Planner />} />
        <Route path="cgpa"       element={<CGPACalculator />} />
        <Route path="community"  element={<Community />} />
        <Route path="profile"    element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
