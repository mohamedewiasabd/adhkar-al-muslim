import React from 'react';

interface PermissionStatusCardProps {
  cardClass: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeClass: string;
  badgeLabel: string;
  actionLabel?: string;
  actionClass?: string;
  onAction?: () => void;
}

export const PermissionStatusCard: React.FC<PermissionStatusCardProps> = ({
  cardClass,
  icon,
  title,
  description,
  badgeClass,
  badgeLabel,
  actionLabel,
  actionClass,
  onAction
}) => (
  <div className={`mb-4 p-3 rounded-xl ${cardClass}`}>
    <div className="flex items-start gap-2">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="text-xs flex-1">
        <span className="font-bold text-stone-800 dark:text-stone-200 block">
          {title}
        </span>
        <span className="text-[11px] text-stone-600 dark:text-stone-400 block mt-0.5">
          {description}
        </span>
        <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-[11px] font-bold ${badgeClass}`}>
          {badgeLabel}
        </span>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={`mt-2 w-full py-2 rounded-xl text-white font-bold text-xs transition-colors ${actionClass || ''}`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);