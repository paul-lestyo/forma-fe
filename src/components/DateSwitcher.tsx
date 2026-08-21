import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface DateSwitcherProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
}

export const DateSwitcher: React.FC<DateSwitcherProps> = ({ currentDateStr, onDateChange }) => {
  const dateObj = parseISO(currentDateStr);

  const handlePrev = () => {
    onDateChange(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  };

  const handleNext = () => {
    onDateChange(format(addDays(dateObj, 1), 'yyyy-MM-dd'));
  };

  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy', { locale: enUS });

  return (
    <div className="flex items-center justify-between py-1 px-2 mb-4">
      <button
        onClick={handlePrev}
        className="p-1 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors"
        title="Previous Day"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <h2 className="text-base font-bold text-slate-900 tracking-tight text-center">
        {formattedDate}
      </h2>

      <button
        onClick={handleNext}
        className="p-1 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors"
        title="Next Day"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
