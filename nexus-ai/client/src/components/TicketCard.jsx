import React from 'react';
import { 
  Laptop, 
  Users, 
  Building2, 
  FileQuestion, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';

export default function TicketCard({ ticket, onStatusChange }) {
  if (!ticket) return null;

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          label: 'Open',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400 animate-pulse',
          label: 'In Progress',
        };
      case 'RESOLVED':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400',
          label: 'Resolved',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  // Priority indicator
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  // Category Icon & Name
  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'IT_SUPPORT':
        return { icon: Laptop, name: 'IT Support', color: 'text-cyan-400' };
      case 'HR_REQUEST':
        return { icon: Users, name: 'HR Request', color: 'text-purple-400' };
      case 'FACILITIES':
        return { icon: Building2, name: 'Facilities', color: 'text-emerald-400' };
      default:
        return { icon: FileQuestion, name: 'General', color: 'text-slate-400' };
    }
  };

  const statusInfo = getStatusBadge(ticket.status);
  const catInfo = getCategoryDetails(ticket.category);
  const CatIcon = catInfo.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-5 shadow-lg shadow-black/20 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <CatIcon className={`w-4 h-4 ${catInfo.color}`} />
            <span className="text-slate-300">{catInfo.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1 mb-2">
          {ticket.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
          {ticket.description}
        </p>
      </div>

      {/* Footer Details & Status Changer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(
              ticket.priority
            )}`}
          >
            {ticket.priority}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(ticket.created_at)}</span>
          </div>
        </div>

        {/* Status Transition Selector */}
        {onStatusChange && (
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
            className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-slate-700"
            title="Change Ticket Status"
          >
            <option value="OPEN">Mark Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        )}
      </div>
    </div>
  );
}

