import React from 'react';
import { User } from '../types';

interface ProfileTabProps {
  user: User;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 max-w-sm mx-auto min-h-[440px] flex flex-col justify-between text-center space-y-4">
      <div className="space-y-4">
        {/* Profile Avatar (Pure Black Circle Monogram) */}
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md shadow-slate-900/10">
          {user.display_name?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">{user.display_name}</h2>
          <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full mt-2">
            {user.title_rank || 'Novice Adventurer'}
          </span>
        </div>

        {/* Level Stats (Pure Monochrome Slate Card) */}
        <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <div>
            <span className="text-base font-bold text-slate-900 block">{user.level}</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Level</p>
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 font-mono block">{user.total_exp}</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Total EXP</p>
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block">{user.streak_days}d</span>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Streak</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-2xl transition-colors mt-2"
      >
        Log Out
      </button>
    </div>
  );
};
