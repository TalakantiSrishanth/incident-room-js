'use client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Clock, User, MessageSquare, ArrowUpRight } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './Badges';

const PRIORITY_LEFT_BORDER = {
  low: 'border-l-blue-500',
  medium: 'border-l-amber-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export default function IncidentCard({ incident }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/incidents/${incident._id}`)}
      className={`group relative bg-gray-900/60 hover:bg-gray-900 border border-white/5 hover:border-white/10 border-l-2 ${PRIORITY_LEFT_BORDER[incident.priority] || 'border-l-gray-600'} rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-snug truncate group-hover:text-blue-300 transition-colors">
            {incident.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-1 leading-relaxed">{incident.description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <div className="p-1.5 bg-white/5 rounded-lg">
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <StatusBadge status={incident.status} />
        <PriorityBadge priority={incident.priority} />
      </div>

      {incident.latest_update && (
        <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 mb-3">
          <MessageSquare className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-gray-500 text-xs line-clamp-1 leading-relaxed">{incident.latest_update}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <User className="w-3 h-3" />
          <span className="text-gray-500">{incident.reporter_name}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
        </span>
        {incident.updated_at !== incident.created_at && (
          <span className="ml-auto">
            Updated {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}
