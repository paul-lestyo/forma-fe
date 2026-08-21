import React from 'react';
import { User } from '../types';

interface LevelHeaderProps {
  user: User;
  showLevelUpModal?: boolean;
  onCloseLevelUpModal?: () => void;
}

export const LevelHeader: React.FC<LevelHeaderProps> = ({
  user,
  showLevelUpModal,
  onCloseLevelUpModal,
}) => {
  const targetExp = user.level * 100;
  const percentage = Math.min(100, Math.max(0, Math.round((user.current_exp / targetExp) * 100)));

  return (
    <div className="space-y-1.5 mb-5">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Daily EXP Progress (Lvl {user.level})</span>
        <span className="font-semibold text-slate-900 font-mono tracking-tight">{user.current_exp} / {targetExp} EXP</span>
      </div>

      {/* Sleek 6px Progress Bar (Track: slate-100, Fill: solid slate-900 black) */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Level Up Dialog */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-xl border border-slate-100 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Level Up to Lvl {user.level}!</h3>
            <p className="text-xs text-slate-500">
              Great job! Your EXP reached the next level target.
            </p>
            <button
              onClick={onCloseLevelUpModal}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
