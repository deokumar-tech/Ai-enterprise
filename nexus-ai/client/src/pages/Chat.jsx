import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { Sparkles, Bot, ShieldCheck, Zap } from 'lucide-react';

export default function Chat() {
  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-3">
      {/* Informative Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Autonomous Intake Engine:</span>
          <span className="text-slate-400 hidden sm:inline">
            Say "I need to request PTO" or "Fix my laptop" and NexusAI will autonomously create a structured ticket in PostgreSQL.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Gemini GenAI Server-Side
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Isolated Session
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}

