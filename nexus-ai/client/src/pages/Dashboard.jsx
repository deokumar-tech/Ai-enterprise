import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';
import { 
  Sparkles, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  Inbox
} from 'lucide-react';

export default function Dashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/tickets/stats'),
        api.get('/tickets'),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (ticketsRes.data?.success) {
        // Take 4 most recent tickets
        setRecentTickets(ticketsRes.data.tickets.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Enterprise Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Team Member'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              NexusAI monitors company policies, assists with inquiries, and autonomously creates IT & HR tickets straight from your conversation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask NexusAI or Open Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Requests
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.total || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Managed under req.user.id</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Open Tickets
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.open || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting review / action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              In Progress
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.in_progress || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Assigned & actively handled</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Resolved
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.resolved || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Completed successfully</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Status & Architecture Indicators */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">System Architecture:</span>
            <span className="text-slate-400">React Vite • Node/Express • PostgreSQL • Google Gemini</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              API Online
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              JWT User Isolation Active
            </span>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recent Workflow Requests
            </h2>
            <p className="text-xs text-slate-400">
              Your latest tickets created automatically via AI or intake
            </p>
          </div>
          <Link
            to="/tickets"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No tickets generated yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start a chat with NexusAI to ask policy questions or request actions like PTO, equipment repairs, or access requests.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Chat</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

