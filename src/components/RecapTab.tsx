import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { RecapData } from '../types';
import { Loader2 } from 'lucide-react';

export const RecapTab: React.FC = () => {
  const [data, setData] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecap = async () => {
      setLoading(true);
      try {
        const res = await api.get('/recap');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch recap data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecap();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  const expHistory = data?.exp_history || [];
  const maxEXP = Math.max(...expHistory.map((h) => h.exp_earned), 50);
  const completionRate = Math.min(100, Math.round(data?.weekly_completion_rate || 0));

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Pure Monochrome Header */}
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Weekly Analytics</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            +{data?.total_exp_this_week || 0} EXP this week
          </p>
        </div>

        {/* 3 Metric Cards (Pure Monochrome Slate & Black) */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <span className="text-base font-bold text-slate-900 block">{data?.streak_days || 0}d</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Streak</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <span className="text-base font-bold text-slate-900 block">{data?.total_quests_completed || 0}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Completed</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <span className="text-base font-bold text-slate-900 block">{data?.active_routines_count || 0}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Routines</span>
          </div>
        </div>

        {/* 7-Day EXP Bar Chart (Pure Monochrome) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">7-Day Activity</span>
            <span className="text-[10px] font-mono text-slate-400">Peak: {data?.peak_day || 'Today'}</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-3 pb-1 border-b border-slate-100">
            {expHistory.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(10, Math.round((item.exp_earned / maxEXP) * 100)));
              const isToday = idx === expHistory.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className={`text-[9px] font-mono ${isToday ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {item.exp_earned}
                  </span>

                  <div
                    className={`w-full max-w-[16px] rounded-t-md transition-all duration-300 ${
                      isToday ? 'bg-slate-900' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span className={`text-[9px] font-medium truncate w-full text-center ${isToday ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Completion Rate (Pure Monochrome Bar) */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Weekly Completion Rate</span>
            <span className="font-bold text-slate-900 font-mono">{completionRate}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
