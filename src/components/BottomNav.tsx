import React from 'react';
import { Target, Repeat, BarChart3, User as UserIcon } from 'lucide-react';

export type TabType = 'tracker' | 'routine' | 'recap' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'tracker' as TabType, label: 'Tracker', icon: Target },
    { id: 'routine' as TabType, label: 'Routine', icon: Repeat },
    { id: 'recap' as TabType, label: 'Recap', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-5 left-0 right-0 z-40 px-4">
      <div className="max-w-xs mx-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg shadow-slate-200/50 px-3 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {isActive && <span>{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
