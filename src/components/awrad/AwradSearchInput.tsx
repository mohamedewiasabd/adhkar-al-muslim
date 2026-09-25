import React from 'react';
import { Search } from 'lucide-react';

interface AwradSearchInputProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
}

export const AwradSearchInput: React.FC<AwradSearchInputProps> = ({ value, onChange, onClear }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="ابحث باسم الورد، الشيخ، أو الكلمة (مثلاً: ابن تيمية، النووي، البحر، الحداد)..."
      className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
    />
    <Search className="absolute right-3.5 top-3 w-4 h-4 text-stone-400" />
    {value && (
      <button
        onClick={onClear}
        className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1"
      >
        مسح
      </button>
    )}
  </div>
);