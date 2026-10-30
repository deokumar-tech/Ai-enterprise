import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Ticket, HelpCircle, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'System overview & stats',
    },
    {
      name: 'AI Chat Assistant',
      path: '/chat',
      icon: MessageSquareText,
      description: 'Policy Q&A & Ticket auto-creation',
    },
    {
      name: 'Tickets',
      path: '/tickets',
      icon: Ticket,
      description: 'Track HR & IT requests',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                <div className="flex flex-col text-left">
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Enterprise Guidance */}
        <div className="pt-4 border-t border-slate-800/80 px-2">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-900/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Auto-Ticketing</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Chat directly with NexusAI. Need PTO or hardware support? NexusAI automatically creates your ticket!
            </p>
          </div>
        </div>
      </div>

      {/* Security & RLS badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>RLS Data Isolation: Active</span>
        </div>
      </div>
    </aside>
  );
}

