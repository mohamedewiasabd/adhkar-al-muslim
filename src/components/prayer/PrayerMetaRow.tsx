import React from 'react';
import { MapPin, BellRing } from 'lucide-react';
import { methodLabel } from '../../utils/prayerTimes';
import { PrayerSettings } from '../../utils/prayer/types';
import { NotifState } from '../../hooks/usePrayerTimes';

interface PrayerMetaRowProps {
  settings: PrayerSettings;
  notifState: NotifState;
}

export const PrayerMetaRow: React.FC<PrayerMetaRowProps> = ({ settings, notifState }) => (
  <div className="grid grid-cols-2 gap-3 mb-4">
    <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="text-sm">
        <div className="font-semibold">{settings.city || 'موقعي'}</div>
        <div className="text-xs text-stone-500 dark:text-stone-400">{settings.lat.toFixed(3)}°, {settings.lng.toFixed(3)}°</div>
      </div>
    </div>
    <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 flex items-center gap-2">
      <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="text-sm">
        <div className="font-semibold">{methodLabel(settings.method)}</div>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          {notifState === 'granted' ? 'الإشعارات مفعّلة' : notifState === 'denied' ? 'الإشعارات مرفوضة' : 'لم تُفعّل الإشعارات'}
        </div>
      </div>
    </div>
  </div>
);