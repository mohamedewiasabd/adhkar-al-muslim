import React from 'react';
import { Clock, Volume2 } from 'lucide-react';
import { formatCountdown } from '../../utils/prayerTimes';
import { NextPrayer } from '../../utils/prayer/types';

interface PrayerHeroProps {
  next: NextPrayer;
  countdown: string;
  adhanEnabled: boolean;
}

export const PrayerHero: React.FC<PrayerHeroProps> = ({ next, countdown, adhanEnabled }) => (
  <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/20 p-6 mb-4 relative">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)', backgroundSize: '28px 28px' }} />
    <div className="flex items-center justify-between mb-2 relative">
      <span className="inline-flex items-center gap-1.5 text-emerald-100 text-sm font-medium bg-white/10 rounded-full px-3 py-1">
        <Clock className="w-4 h-4" /> الصلاة القادمة
      </span>
      {adhanEnabled && (
        <span className="inline-flex items-center gap-1.5 text-emerald-100 text-xs bg-white/10 rounded-full px-2.5 py-1">
          <Volume2 className="w-3.5 h-3.5" /> الأذان مفعّل
        </span>
      )}
    </div>
    <div className="relative flex items-end justify-between">
      <div>
        <div className="text-5xl font-extrabold mb-1">{next.arabic}</div>
        <div className="text-emerald-100 text-lg">{next.time}</div>
      </div>
      <div className="text-left">
        <div className={`font-mono text-3xl font-bold tabular-nums ${countdown === 'حان الوقت الآن' ? 'text-amber-300' : 'text-white'}`}>
          {countdown}
        </div>
        <div className="text-emerald-100 text-xs mt-1">{formatCountdown(next.minutesLeft)}</div>
      </div>
    </div>
  </div>
);