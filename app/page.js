'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Radio, AlertOctagon, Search, Filter, Activity, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import IncidentCard from '@/components/IncidentCard';
import CreateIncidentForm from '@/components/CreateIncidentForm';
import { getSocket } from '@/lib/socket';

const STAT_CONFIG = [
  { key: 'open', label: 'Open', icon: ShieldAlert, color: 'text-red-400', ring: 'ring-red-500/20', bg: 'bg-red-500/10', glow: 'shadow-red-500/10' },
  { key: 'investigating', label: 'Investigating', icon: Activity, color: 'text-amber-400', ring: 'ring-amber-500/20', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/10' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-emerald-400', ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10' },
  { key: 'critical', label: 'Critical', icon: Clock, color: 'text-orange-400', ring: 'ring-orange-500/20', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/10' },
];

const STATUS_FILTERS = ['all', 'open', 'investigating', 'resolved'];

export default function Home() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const socket = getSocket();
    socket.on('incident-updated', fetchIncidents);
    socket.on('incident-status-changed', fetchIncidents);
    return () => {
      socket.off('incident-updated', fetchIncidents);
      socket.off('incident-status-changed', fetchIncidents);
    };
  }, [fetchIncidents]);

  const filtered = incidents.filter(inc => {
    const matchStatus = filter === 'all' || inc.status === filter;
    const matchSearch = !search ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.reporter_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.priority === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-30" />
              <div className="relative p-2.5 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 rounded-xl">
                <Radio className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Incident Room</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                Real-time operations center
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, ring, bg, glow }) => (
            <div
              key={key}
              className={`${bg} ring-1 ${ring} rounded-2xl p-4 shadow-lg ${glow} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-4 h-4 ${color} opacity-80`} />
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{counts[key]}</div>
              </div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or reporter…"
              className="w-full bg-gray-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900 border border-white/5 rounded-xl p-1">
            <Filter className="w-3.5 h-3.5 text-gray-500 ml-2 flex-shrink-0" />
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === s
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-800 rounded-lg w-2/5" />
                  <div className="h-4 bg-gray-800 rounded-lg w-16" />
                </div>
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-3/4 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-800 rounded-full w-20" />
                  <div className="h-5 bg-gray-800 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-gray-300 font-semibold text-lg mb-2">
              {incidents.length === 0 ? 'No incidents yet' : 'No matching incidents'}
            </h3>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              {incidents.length === 0
                ? 'All clear! Report an incident when something comes up.'
                : 'Try adjusting your filters or search term.'}
            </p>
            {incidents.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Report first incident
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(incident => (
              <IncidentCard key={incident._id} incident={incident} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateIncidentForm
          onCreated={inc => setIncidents(prev => [inc, ...prev])}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
