'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft, Send, Sparkles, ChevronDown, Clock, User,
  CheckCircle2, Loader2, AlertCircle, Brain, Zap, FileText, Scale
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '@/components/Badges';
import { getSocket } from '@/lib/socket';

const AI_TYPES = [
  { value: 'summary', label: 'Summary', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { value: 'next_actions', label: 'Next Actions', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { value: 'priority_review', label: 'Priority', icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

export default function IncidentDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [incident, setIncident] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({ message: '', author_name: '' });
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedAiType, setSelectedAiType] = useState('summary');
  const [statusChanging, setStatusChanging] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const updatesEndRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [incRes, updRes, aiRes] = await Promise.all([
        fetch(`/api/incidents/${id}`),
        fetch(`/api/incidents/${id}/updates`),
        fetch(`/api/incidents/${id}/ai`),
      ]);
      setIncident(await incRes.json());
      setUpdates(await updRes.json());
      setAiResults(await aiRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
    const socket = getSocket();
    socket.emit('join-incident', id);
    socket.on('new-update', update => {
      setUpdates(prev => [...prev, update]);
      setTimeout(() => updatesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    socket.on('incident-status-changed', ({ incident_id, status }) => {
      if (incident_id === id) {
        setIncident(prev => prev ? { ...prev, status } : prev);
      }
    });
    return () => {
      socket.emit('leave-incident', id);
      socket.off('new-update');
      socket.off('incident-status-changed');
    };
  }, [id, fetchAll]);

  useEffect(() => {
    updatesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [updates]);

  const postUpdate = async () => {
    setUpdateError('');
    if (!updateForm.message.trim() || !updateForm.author_name.trim()) {
      setUpdateError('Message and author name required');
      return;
    }
    setPostingUpdate(true);
    try {
      const res = await fetch(`/api/incidents/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpdateForm(f => ({ ...f, message: '' }));
    } catch (e) {
      setUpdateError(e.message);
    } finally {
      setPostingUpdate(false);
    }
  };

  const changeStatus = async status => {
    setStatusChanging(true);
    setShowStatusMenu(false);
    try {
      const res = await fetch(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) setIncident(data);
    } finally {
      setStatusChanging(false);
    }
  };

  const runAI = async () => {
    setAiError('');
    setAiLoading(true);
    try {
      const res = await fetch(`/api/incidents/${id}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedAiType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResults(prev => [data, ...prev]);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-600 text-sm">Loading incident…</p>
        </div>
      </div>
    );
  }

  if (!incident || incident.error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-300 font-medium mb-1">Incident not found</p>
          <p className="text-gray-600 text-sm mb-5">This incident may have been removed or the link is invalid.</p>
          <button onClick={() => router.push('/')} className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusOptions = ['open', 'investigating', 'resolved'].filter(s => s !== incident.status);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-white truncate">{incident.title}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
            </div>
          </div>

          {/* Status changer */}
          <div className="relative flex-shrink-0">
            <button
              disabled={statusChanging}
              onClick={() => setShowStatusMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
            >
              {statusChanging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Change Status
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1.5 bg-gray-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden min-w-40">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white capitalize transition-colors"
                  >
                    Mark as <span className="font-semibold">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details + updates */}
        <div className="lg:col-span-2 space-y-5">
          {/* Incident info */}
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Incident Details</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">{incident.description}</p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div>
                <span className="text-xs text-gray-600 font-medium">Reporter</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                    {incident.reporter_name[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm truncate">{incident.reporter_name}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-600 font-medium">Created</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-300 text-sm">{format(new Date(incident.created_at), 'MMM d, HH:mm')}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-600 font-medium">Last Updated</span>
                <div className="mt-1 text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>

          {/* Live updates */}
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Live Updates
                  <span className="ml-2 text-gray-600 font-normal normal-case tracking-normal">({updates.length})</span>
                </h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>

            <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
              {updates.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 text-sm">No updates yet.</p>
                  <p className="text-gray-700 text-xs mt-1">Post the first update below.</p>
                </div>
              ) : (
                updates.map(u => (
                  <div key={u._id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                      {u.author_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-400">{u.author_name}</span>
                        <span className="text-[10px] text-gray-600">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{u.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={updatesEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 space-y-2.5">
              {updateError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{updateError}</p>
              )}
              <div className="flex gap-2 items-end">
                <input
                  value={updateForm.author_name}
                  onChange={e => setUpdateForm(f => ({ ...f, author_name: e.target.value }))}
                  placeholder="Your name"
                  className="w-28 flex-shrink-0 bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                />
                <input
                  value={updateForm.message}
                  onChange={e => setUpdateForm(f => ({ ...f, message: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && postUpdate()}
                  placeholder="Post an update… (Enter to send)"
                  className="flex-1 bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                />
                <button
                  onClick={postUpdate}
                  disabled={postingUpdate}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex-shrink-0"
                >
                  {postingUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI panel */}
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
              <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Assistant</h2>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                {AI_TYPES.map(t => {
                  const Icon = t.icon;
                  const isSelected = selectedAiType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setSelectedAiType(t.value)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-medium transition-all border ${
                        isSelected
                          ? `${t.bg} ${t.border} ${t.color}`
                          : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {aiError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{aiError}</p>
              )}

              <button
                onClick={runAI}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/20"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? 'Analyzing…' : 'Run Analysis'}
              </button>
            </div>
          </div>

          {/* AI Results */}
          {aiResults.length > 0 && (
            <div className="space-y-3">
              {aiResults.map(r => {
                const aiType = AI_TYPES.find(t => t.value === r.type);
                const Icon = aiType?.icon || FileText;
                return (
                  <div key={r._id} className={`${aiType?.bg || 'bg-gray-900/60'} border ${aiType?.border || 'border-white/5'} rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${aiType?.color || 'text-gray-400'}`}>
                        <Icon className="w-3 h-3" />
                        {aiType?.label || r.type}
                      </div>
                      <span className="text-[10px] text-gray-600">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{r.result_text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
