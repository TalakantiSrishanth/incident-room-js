export const PRIORITY_COLORS = {
  low: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
};

export const STATUS_COLORS = {
  open: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  investigating: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
};

export const STATUS_DOT = {
  open: 'bg-red-400',
  investigating: 'bg-amber-400 animate-pulse',
  resolved: 'bg-emerald-400',
};

export const PRIORITY_ICON = {
  low: '▼',
  medium: '●',
  high: '▲',
  critical: '⚡',
};

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wide ${PRIORITY_COLORS[priority] || 'bg-gray-700 text-gray-400'}`}>
      <span className="text-[9px]">{PRIORITY_ICON[priority]}</span>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${STATUS_COLORS[status] || 'bg-gray-700 text-gray-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
}
