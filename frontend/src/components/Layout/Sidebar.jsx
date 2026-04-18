import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardList, Bot, CalendarDays,
  Calculator, Users, Bell, UserCircle, LogOut, GraduationCap,
  ChevronLeft, Menu
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/notes',       icon: BookOpen,         label: 'Notes'      },
  { to: '/assignments', icon: ClipboardList,    label: 'Assignments'},
  { to: '/ai-tools',    icon: Bot,              label: 'AI Tools'   },
  { to: '/planner',     icon: CalendarDays,     label: 'Planner'    },
  { to: '/cgpa',        icon: Calculator,       label: 'CGPA Calc'  },
  { to: '/community',   icon: Users,            label: 'Community'  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full z-40 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        shadow-lg transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* ── Logo ── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg gradient-text whitespace-nowrap animate-fade-in">
            CampusHub
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed
            ? <Menu size={16} className="text-gray-400" />
            : <ChevronLeft size={16} className="text-gray-400" />
          }
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active' : 'sidebar-item'
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User Section ── */}
      <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
        <NavLink
          to="/profile"
          title={collapsed ? 'Profile' : undefined}
          className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
        >
          <UserCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span className="truncate animate-fade-in">{user?.name || 'Profile'}</span>}
        </NavLink>

        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className="sidebar-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
