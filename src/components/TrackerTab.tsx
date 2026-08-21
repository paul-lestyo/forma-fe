import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, QuestItem, Priority } from '../types';
import { LevelHeader } from './LevelHeader';
import { DateSwitcher } from './DateSwitcher';
import { QuestCard } from './QuestCard';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TrackerTabProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({ user, onUserUpdate }) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);

  const fetchTrackerData = async (date: string) => {
    setLoading(true);
    try {
      // Promise.all with 150ms micro-delay so loading Skeleton animation is pleasantly visible to human eyes
      const [res] = await Promise.all([
        api.get(`/tracker?date=${date}`),
        new Promise((resolve) => setTimeout(resolve, 150)),
      ]);
      setQuests(res.data.quests || []);
    } catch (err) {
      console.error('Failed to fetch tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData(currentDateStr);
  }, [currentDateStr]);

  const cyclePriority = () => {
    if (newPriority === 'LOW') setNewPriority('MEDIUM');
    else if (newPriority === 'MEDIUM') setNewPriority('HIGH');
    else setNewPriority('LOW');
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case 'LOW':
        return '+10 EXP';
      case 'HIGH':
        return '+25 EXP';
      case 'MEDIUM':
      default:
        return '+15 EXP';
    }
  };

  const handleAddQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || submitting) return;

    setSubmitting(true);
    try {
      let expReward = 15;
      if (newPriority === 'LOW') expReward = 10;
      if (newPriority === 'HIGH') expReward = 25;

      const res = await api.post('/todos', {
        title: newTitle.trim(),
        priority: newPriority,
        exp_reward: expReward,
        date: currentDateStr,
      });

      setQuests((prev) => [...prev, res.data]);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to add quest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (quest: QuestItem) => {
    try {
      const res = await api.patch('/todos/toggle', {
        id: quest.id,
        template_id: quest.template_id,
        item_type: quest.item_type,
        date: currentDateStr,
      });

      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id && q.item_type === quest.item_type
            ? { ...q, completed: res.data.completed }
            : q
        )
      );

      const updatedUser: User = {
        ...user,
        level: res.data.new_level,
        current_exp: res.data.current_exp,
        total_exp: res.data.total_exp,
      };
      onUserUpdate(updatedUser);

      if (res.data.level_up) {
        setShowLevelUpModal(true);
      }
    } catch (err) {
      console.error('Failed to toggle quest:', err);
    }
  };

  const handleDelete = async (quest: QuestItem) => {
    try {
      await api.delete(`/todos/${quest.id}?type=${quest.item_type}`);
      setQuests((prev) => prev.filter((q) => !(q.id === quest.id && q.item_type === quest.item_type)));
    } catch (err) {
      console.error('Failed to delete quest:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex flex-col justify-between transition-all">
      <div>
        {/* Date Header */}
        <DateSwitcher currentDateStr={currentDateStr} onDateChange={setCurrentDateStr} />

        {/* Progress Bar */}
        <LevelHeader
          user={user}
          showLevelUpModal={showLevelUpModal}
          onCloseLevelUpModal={() => setShowLevelUpModal(false)}
        />

        {/* Task List Container with Sleek Skeleton Loading */}
        <div className="min-h-[160px] my-3">
          {loading ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
              <div className="h-5 bg-slate-100 rounded-md w-2/3"></div>
              <div className="h-5 bg-slate-100 rounded-md w-4/5"></div>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No tasks for this day.
            </div>
          ) : (
            <div className="space-y-1">
              {quests.map((q) => (
                <QuestCard key={`${q.item_type}-${q.id}`} quest={q} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Minimal Add Task Form */}
      <form onSubmit={handleAddQuest} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          placeholder="New task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={cyclePriority}
          className="text-xs font-mono font-medium text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer flex-shrink-0"
          title="Click to change EXP reward"
        >
          {getPriorityLabel(newPriority)}
        </button>

        <button
          type="submit"
          disabled={!newTitle.trim() || submitting}
          className="text-slate-700 hover:text-slate-900 p-1 disabled:opacity-30 transition-colors flex-shrink-0"
          title="Add Task"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
