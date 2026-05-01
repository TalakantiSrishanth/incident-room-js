'use client';
import { useState } from 'react';
import { X, ShieldAlert, ChevronDown } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-blue-400', desc: 'Minor impact, can wait' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', desc: 'Moderate impact' },
  { value: 'high', label: 'High', color: 'text-orange-400', desc: 'Significant impact' },
  { value: 'critical', label: 'Critical', color: 'text-red-400', desc: 'Severe, needs immediate action' },
];

export default function CreateIncidentForm({ onCreated, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', reporter_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.reporter_name.trim()) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      onCreated(data);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === form.priority);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Report Incident</h2>
              <p className="text-xs text-gray-500">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Payment API failing for some users"
              className="w-full bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail — what's happening, who's affected, and any error messages…"
              rows={3}
              className="w-full bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full appearance-none bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/10 transition-all pr-9 cursor-pointer"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
              {selectedPriority && (
                <p className={`text-xs ${selectedPriority.color} opacity-70`}>{selectedPriority.desc}</p>
              )}
            </div>

            {/* Reporter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                value={form.reporter_name}
                onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
                placeholder="Your name"
                className="w-full bg-gray-800/60 border border-white/5 focus:border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reporting…
              </span>
            ) : 'Report Incident'}
          </button>
        </div>
      </div>
    </div>
  );
}
