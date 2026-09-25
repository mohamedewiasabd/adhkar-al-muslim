import React from 'react';

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ on, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
    aria-pressed={on}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-0.5' : 'left-[22px]'}`}
    />
  </button>
);