import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { RecapData, ContributionDay } from '../types';
import { Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const RecapTab: React.FC = () => {
  const [data, setData] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  const fetchRecap = async (offset: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/recap?week_offset=${offset}`);
      setData(res.data);

      // Auto-select today if in grid, or latest active day
      const grid = (res.data?.contribution_grid as ContributionDay[]) || [];
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayActivity = grid.find((m) => m.date === todayStr);
      if (todayActivity) {
        setSelectedDay(todayActivity);
      } else if (grid.length > 0) {
        const nonFuture = grid.filter((g) => !g.is_future);
        setSelectedDay(nonFuture.length > 0 ? nonFuture[nonFuture.length - 1] : grid[0]);
      }
    } catch (err) {
      console.error('Failed to fetch recap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap(weekOffset);
  }, [weekOffset]);

  // Auto scroll grid to the right (latest weeks)
  useEffect(() => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollLeft = gridScrollRef.current.scrollWidth;
    }
  }, [data]);

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

  // Chunk contribution grid into weeks (7 days each)
  const contributionGrid = data?.contribution_grid || [];
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < contributionGrid.length; i += 7) {
    weeks.push(contributionGrid.slice(i, i + 7));
  }

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

        {/* GitHub-style Contribution Heatmap */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-900">
                Kontribusi Aktivitas
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {data?.total_contributions || 0} kegiatan selesai
            </span>
          </div>

          {/* Heatmap Matrix with horizontal scroll support */}
          <div
            ref={gridScrollRef}
            className="overflow-x-auto pb-1 scrollbar-none select-none"
          >
            <div className="min-w-fit flex flex-col gap-1">
              {/* Month Labels Header */}
              <div className="flex gap-[3px] pl-6 h-3.5 items-center">
                {weeks.map((week, idx) => {
                  const isNewMonth = idx === 0 || week[0].month !== weeks[idx - 1][0].month;
                  return (
                    <div key={idx} className="w-[10px] relative flex justify-start">
                      {isNewMonth && (
                        <span className="absolute left-0 -top-0.5 text-[8px] font-mono text-slate-400 font-medium whitespace-nowrap pointer-events-none">
                          {week[0].month}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grid: 7 rows x N week columns */}
              <div className="flex gap-[3px]">
                {/* Left Day Labels: Sen, Rab, Jum */}
                <div className="flex flex-col gap-[3px] pr-1 justify-between text-[8px] font-medium text-slate-400 font-mono select-none">
                  <span className="h-[10px] leading-[10px]">Sen</span>
                  <span className="h-[10px] leading-[10px] invisible">Sel</span>
                  <span className="h-[10px] leading-[10px]">Rab</span>
                  <span className="h-[10px] leading-[10px] invisible">Kam</span>
                  <span className="h-[10px] leading-[10px]">Jum</span>
                  <span className="h-[10px] leading-[10px] invisible">Sab</span>
                  <span className="h-[10px] leading-[10px] invisible">Min</span>
                </div>

                {/* Week Columns */}
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day) => {
                      const isSelected = selectedDay?.date === day.date;
                      let colorClass = 'bg-slate-100 hover:bg-slate-200';

                      if (day.is_future) {
                        colorClass = 'bg-slate-100/30 cursor-default pointer-events-none';
                      } else if (day.level === 1) {
                        colorClass = 'bg-slate-300 hover:bg-slate-400';
                      } else if (day.level === 2) {
                        colorClass = 'bg-slate-500 hover:bg-slate-600';
                      } else if (day.level === 3) {
                        colorClass = 'bg-slate-700 hover:bg-slate-800';
                      } else if (day.level === 4) {
                        colorClass = 'bg-slate-900 hover:bg-black shadow-xs';
                      }

                      return (
                        <button
                          key={day.date}
                          type="button"
                          disabled={day.is_future}
                          onClick={() => setSelectedDay(day)}
                          className={`w-[10px] h-[10px] rounded-[2px] transition-all duration-150 ${colorClass} ${
                            isSelected ? 'ring-1.5 ring-slate-900 ring-offset-1 z-10' : ''
                          }`}
                          title={
                            day.is_future
                              ? day.date
                              : `${day.date}: +${day.exp_earned} EXP (${day.completed_count} task selesai)`
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
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
            <span className="font-medium font-mono text-[9px]">20 Minggu Terakhir</span>
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
