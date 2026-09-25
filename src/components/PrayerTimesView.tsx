import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2, Sparkles } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { PrayerHero } from './prayer/PrayerHero';
import { PrayerMetaRow } from './prayer/PrayerMetaRow';
import { PrayerTimesList } from './prayer/PrayerTimesList';
import { PrayerSettingsPanel } from './prayer/PrayerSettingsPanel';

export const PrayerTimesView: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    settings, applySettings, now, times, next, countdown, notifState, exactState, toast, scheduling, requestPerms, requestExactPerms, rescheduleNow
  } = usePrayerTimes();

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32">
      <PrayerHero next={next} countdown={countdown} adhanEnabled={settings.adhanEnabled} />
      <PrayerMetaRow settings={settings} notifState={notifState} />
      <PrayerTimesList times={times} next={next} now={now} />

      <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-100 leading-relaxed mb-4">
        <div className="font-bold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> تذكير فقهي</div>
        صلاة الأوابين تُقضى في النهار بعد الشروق وقبل الظهر، وقد اخترت لها هنا «قبل الظهر بساعة». وقيام الليل يُستحب في الثلث الأخير من الليل (من منتصف الليل حتى الفجر)، وقد حددنا لك بدايته.
      </div>

      <button
        onClick={() => setShowSettings(prev => !prev)}
        className="w-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between text-stone-700 dark:text-stone-200 font-semibold"
      >
        <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> إعدادات المواقيت والإشعارات</span>
        {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showSettings && (
        <PrayerSettingsPanel
          settings={settings}
          applySettings={applySettings}
          notifState={notifState}
          exactState={exactState}
          requestPerms={requestPerms}
          requestExactPerms={requestExactPerms}
          rescheduleNow={rescheduleNow}
          scheduling={scheduling}
        />
      )}

      {toast && (
        <div className={`fixed bottom-24 inset-x-0 px-6 z-50 flex justify-center ${toast.err ? 'pointer-events-auto' : ''}`}>
          <div className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${toast.err ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
};