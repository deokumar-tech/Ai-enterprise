import React from 'react';
import { User, Sparkles, CheckCircle2, Ticket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChatMessage({ message, role, createdAt, ticket }) {
  const isUser = role === 'user';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex gap-3.5 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20 text-white mt-1">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-400">
            {isUser ? 'You' : 'NexusAI'}
          </span>
          {createdAt && (
            <span className="text-[10px] text-slate-400">
              {formatTime(createdAt)}
            </span>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/60 backdrop-blur-sm'
          }`}
        >
          {message}
        </div>

        {/* Dynamic Ticket Generated Badge (If ticket action was triggered) */}
        {ticket && (
          <div className="mt-2.5 w-full bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Automated Workflow Ticket Generated</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {ticket.status || 'OPEN'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-200">
                {ticket.title}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-blue-400 font-mono">
                  {ticket.category}
                </span>
                <span>•</span>
                <span>Priority: <span className="font-semibold text-amber-400">{ticket.priority}</span></span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
              <Link
                to="/tickets"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                <span>View in Tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

