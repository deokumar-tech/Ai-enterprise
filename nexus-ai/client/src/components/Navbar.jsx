import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
              NexusAI
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Enterprise
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Intelligent Enterprise Assistant & Autonomous Ticketing
          </p>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Gemini AI Engine Active
        </div>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-200 leading-tight">
                {user.full_name}
              </p>
              <p className="text-xs text-slate-400 leading-tight">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-red-500/20 hover:border-red-500/30 border border-slate-700/60 transition-all duration-200"
          title="Sign out of NexusAI"
        >
          <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

