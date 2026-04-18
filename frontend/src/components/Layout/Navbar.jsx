import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function Navbar({ collapsed }) {
  const { darkMode, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]         = useState(0);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/notifications');
        setNotifications(data.data || []);
        setUnread(data.unreadCount || 0);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 60000); // poll every minute
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const typeIcon = { deadline: '⚠️', announcement: '📢', community: '💬', system: '🔔', grade: '📊' };

  const leftOffset = collapsed ? 'left-16' : 'left-60';

  return (
    <header
      className={`
        fixed top-0 right-0 ${leftOffset} z-30 h-16
        bg-white/80 dark:bg-gray-900/80 glass
        border-b border-gray-100 dark:border-gray-800
        flex items-center px-6 gap-4
        transition-all duration-300
      `}
    >
      {/* Page title greeting */}
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.name?.split(' ')[0]}</span> 👋
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          id="darkmode-toggle"
          className="btn-ghost p-2 rounded-xl"
          title={darkMode ? 'Switch to light' : 'Switch to dark'}
        >
          {darkMode
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} className="text-indigo-600" />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => { setNotifOpen((p) => !p); if (!notifOpen && unread > 0) markAllRead(); }}
            className="btn-ghost p-2 rounded-xl relative"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-400" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 card shadow-2xl z-50 animate-fade-in p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                <button onClick={() => setNotifOpen(false)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No notifications</p>
                ) : notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeIcon[n.type] || '🔔'} {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-glow transition-all"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
