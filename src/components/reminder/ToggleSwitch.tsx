import React from 'react';

interface ToggleSwitchProps {
  on: boolean;
  onChange: () => void;
  large?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ on, onChange, large, id }) => (
  <button
    onClick={onChange}
    id={id}
    className={`rounded-full transition-colors relative ${
      large ? 'w-12 h-6' : 'w-10 h-5'
    } ${on ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}
  >
    <span
      className={`absolute top-0.5 rounded-full bg-white transition-transform ${
        large ? 'w-5 h-5' : 'w-4 h-4'
      } ${on ? (large ? 'left-6' : 'left-5') : 'left-0.5'}`}
    />
  </button>
);