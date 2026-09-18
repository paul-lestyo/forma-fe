import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { RecapData, MonthlyDayActivity } from '../types';
import { Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const RecapTab: React.FC = () => {
  const [data, setData] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<MonthlyDayActivity | null>(null);

  const fetchRecap = async (month: string, offset: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/recap?month=${month}&week_offset=${offset}`);
      setData(res.data);

      // Auto-select today if in this month, or highest EXP day
      const monthly = (res.data?.monthly_activity as MonthlyDayActivity[]) || [];
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayActivity = monthly.find((m) => m.date === todayStr);
      if (todayActivity) {
        setSelectedDay(todayActivity);
      } else if (monthly.length > 0) {
        const peak = [...monthly].sort((a, b) => b.exp_earned - a.exp_earned)[0];
        setSelectedDay(peak);
      } else {
        setSelectedDay(null);
      }
    } catch (err) {
      console.error('Failed to fetch recap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap(currentMonth, weekOffset);
  }, [currentMonth, weekOffset]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentMonth(format(prevDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentMonth(format(nextDate, 'yyyy-MM'));
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  const expHistory = data?.exp_history || [];
  const maxEXP = Math.max(...expHistory.map((h) => h.exp_earned), 50);
  const completionRate = Math.min(100, Math.round(data?.weekly_completion_rate || 0));
  const monthlyActivity = data?.monthly_activity || [];

  // Blank cells before the 1st of month (1=Mon..7=Sun)
  const firstDayOfWeek = monthlyActivity.length > 0 ? monthlyActivity[0].day_of_week : 1;
  const blankCells = Array.from({ length: firstDayOfWeek - 1 });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Pure Monochrome Header */}
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Analytics & Recap</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            +{data?.total_exp_this_week || 0} EXP {weekOffset === 0 ? 'minggu ini' : 'periode ini'}
          </p>
        </div>

        {/* 3 Metric Cards */}
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

        {/* 7-Day EXP Bar Chart (With Week Shifter) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800">7-Day Activity</span>
              {data?.week_range && (
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  ({data.week_range})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Minggu sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
                disabled={weekOffset >= 0}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                title="Minggu berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-0.5">
            <span>+{data?.total_exp_this_week || 0} EXP</span>
            <span>Peak: {data?.peak_day || 'Today'}</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-24 pt-2 pb-1 border-b border-slate-100">
            {expHistory.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(10, Math.round((item.exp_earned / maxEXP) * 100)));
              const isToday = idx === expHistory.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className={`text-[8px] font-mono ${isToday ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
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

        {/* Minimalist GitHub-style Monthly Heatmap */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          {/* Month Switcher Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-900">
                {data?.month_name || currentMonth}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Minimalist 7-Col Matrix Container */}
          <div className="w-full max-w-[224px] mx-auto space-y-1.5">
            {/* Days of Week Header (Mon-Sun) */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, idx) => (
                <span key={idx} className="text-[9px] font-semibold text-slate-400 select-none">
                  {dayName}
                </span>
              ))}
            </div>

            {/* Monthly Heatmap 7-Col Grid (Pure minimalist squares, no date numbers) */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank offset cells for start of month */}
              {blankCells.map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square" />
              ))}

              {/* Day squares with intensity levels */}
              {monthlyActivity.map((d) => {
                const isSelected = selectedDay?.date === d.date;

                let colorClass = 'bg-slate-100 hover:bg-slate-200';
                if (d.level === 1) {
                  colorClass = 'bg-slate-300 hover:bg-slate-400';
                } else if (d.level === 2) {
                  colorClass = 'bg-slate-500 hover:bg-slate-600';
                } else if (d.level === 3) {
                  colorClass = 'bg-slate-700 hover:bg-slate-800';
                } else if (d.level === 4) {
                  colorClass = 'bg-slate-900 hover:bg-black shadow-xs';
                }

                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`aspect-square rounded-[3.5px] transition-all duration-150 ${colorClass} ${
                      isSelected ? 'ring-2 ring-slate-900 ring-offset-1 z-10' : ''
                    }`}
                    title={`${d.date}: +${d.exp_earned} EXP (${d.completed_count} task selesai)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Interactive Day Detail Pill */}
          {selectedDay && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 font-mono">
                {selectedDay.date}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-slate-900">
                  +{selectedDay.exp_earned} EXP
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  ({selectedDay.completed_count} selesai)
                </span>
              </div>
            </div>
          )}

          {/* GitHub-style Less -> More Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="font-medium font-mono text-[9px]">Total: +{data?.total_exp_month || 0} EXP</span>
            <div className="flex items-center gap-1 font-medium">
              <span>Kurang</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" title="0 EXP" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-300" title="1-24 EXP" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-500" title="25-49 EXP" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-700" title="50-99 EXP" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-900" title="100+ EXP" />
              <span>Lebih</span>
            </div>
          </div>
        </div>

        {/* Weekly Completion Rate */}
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
