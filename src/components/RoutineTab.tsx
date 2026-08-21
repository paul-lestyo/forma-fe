import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { HabitTemplate, Priority, Frequency } from '../types';
import { Trash2, Loader2 } from 'lucide-react';

export const RoutineTab: React.FC = () => {
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [expReward, setExpReward] = useState<number>(15);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      setTemplates(res.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const cyclePriority = () => {
    if (priority === 'LOW') {
      setPriority('MEDIUM');
      setExpReward(15);
    } else if (priority === 'MEDIUM') {
      setPriority('HIGH');
      setExpReward(25);
    } else {
      setPriority('LOW');
      setExpReward(10);
    }
  };

  const cycleFrequency = () => {
    if (frequency === 'daily') setFrequency('weekly');
    else if (frequency === 'weekly') setFrequency('monthly');
    else setFrequency('daily');
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case 'LOW': return '+10 EXP';
      case 'HIGH': return '+25 EXP';
      default: return '+15 EXP';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post('/templates', {
        title: title.trim(),
        priority,
        exp_reward: expReward,
        frequency,
      });

      setTemplates((prev) => [res.data, ...prev]);
      setTitle('');
    } catch (err) {
      console.error('Failed to create template:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex flex-col justify-between space-y-4">
      <div>
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Master Routines</h2>
          <p className="text-xs text-slate-400 mt-0.5">Recurring daily, weekly, & monthly habits</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-2 pt-3">
          <input
            type="text"
            required
            placeholder="New habit title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors tracking-tight"
          />

          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={cycleFrequency}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-slate-700 font-semibold text-center transition-colors uppercase text-[10px]"
            >
              {frequency}
            </button>

            <button
              type="button"
              onClick={cyclePriority}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-slate-700 font-semibold text-center transition-colors font-mono text-[10px]"
            >
              {getPriorityLabel(priority)}
            </button>

            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-30 flex-shrink-0"
            >
              {submitting ? '...' : '+ Add'}
            </button>
          </div>
        </form>

        {/* List (Aligned with Plus Jakarta Sans 13px font-medium) */}
        <div className="space-y-1.5 pt-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No routines configured yet.
            </div>
          ) : (
            <div className="space-y-1">
              {templates.map((tmpl) => (
                <div key={tmpl.id} className="flex items-center justify-between py-2 group border-b border-slate-100 last:border-none">
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-slate-900 tracking-tight truncate block">{tmpl.title}</span>
                    <span className="text-xs text-slate-400 font-mono">+{tmpl.exp_reward} EXP • {tmpl.frequency}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(tmpl.id)}
                    className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
