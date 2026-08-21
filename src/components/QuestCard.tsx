import React from 'react';
import { QuestItem } from '../types';
import { Check, X } from 'lucide-react';

interface QuestCardProps {
  quest: QuestItem;
  onToggle: (quest: QuestItem) => void;
  onDelete: (quest: QuestItem) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onToggle, onDelete }) => {
  return (
    <div className="group flex items-center justify-between py-1.5 transition-all">
      {/* Left Item Info */}
      <div
        onClick={() => onToggle(quest)}
        className="flex items-center flex-1 min-w-0 cursor-pointer select-none"
      >
        {/* Minimal Circle Checkbox */}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
            quest.completed
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {quest.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </div>

        {/* Title (Plus Jakarta Sans) + Monospace EXP */}
        <div className="ml-3 flex items-baseline gap-2 truncate">
          <span
            className={`text-[13px] font-medium text-slate-900 tracking-tight truncate transition-all ${
              quest.completed ? 'line-through text-slate-400 font-normal' : ''
            }`}
          >
            {quest.title}
          </span>
          <span className="text-xs text-slate-400 font-normal font-mono flex-shrink-0">
            +{quest.exp_reward} EXP
          </span>
        </div>
      </div>

      {/* Delete Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quest);
        }}
        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2"
        title="Delete Task"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
