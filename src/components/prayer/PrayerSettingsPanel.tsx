import React from 'react';
import { Bell, RefreshCw, Volume2 } from 'lucide-react';
import { PRAYER_METHODS, PRAYER_ORDER, PRAYER_ARABIC } from '../../utils/prayerTimes';
import { isAndroidPlatform } from '../../utils/platform';
import { PrayerSettings } from '../../utils/prayer/types';
import { playAdhanNow, stopAdhan } from '../../utils/adhanPlayer';
import { Toggle } from './Toggle';
import { ExactState, NotifState } from '../../hooks/usePrayerTimes';

interface PrayerSettingsPanelProps {
  settings: PrayerSettings;
  applySettings: (patch: Partial<PrayerSettings>) => void;
  notifState: NotifState;
  exactState: ExactState;
  requestPerms: () => void;
  requestExactPerms: () => void;
  rescheduleNow: () => void;
  scheduling: boolean;
}

export const PrayerSettingsPanel: React.FC<PrayerSettingsPanelProps> = ({
  settings,
  applySettings,
  notifState,
  exactState,
  requestPerms,
  requestExactPerms,
  rescheduleNow,
  scheduling
}) => (
  <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 mt-3 space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">المدينة</span>
        <input
          value={settings.city}
          onChange={e => applySettings({ city: e.target.value })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">طريقة الحساب</span>
        <select
          value={settings.method}
          onChange={e => applySettings({ method: e.target.value })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          {PRAYER_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">خط العرض (lat)</span>
        <input
          type="number" step="0.0001"
          value={settings.lat}
          onChange={e => applySettings({ lat: parseFloat(e.target.value) || 0 })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">خط الطول (lng)</span>
        <input
          type="number" step="0.0001"
          value={settings.lng}
          onChange={e => applySettings({ lng: parseFloat(e.target.value) || 0 })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">مذهب العصر</span>
        <select
          value={settings.asr}
          onChange={e => applySettings({ asr: e.target.value as PrayerSettings['asr'] })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value="standard">الجمهور (الشافعي/مالكي/حنابلة)</option>
          <option value="hanafi">الحنفي</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">المناطق العالية العرض</span>
        <select
          value={settings.highLats}
          onChange={e => applySettings({ highLats: e.target.value as PrayerSettings['highLats'] })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value="recommended">الموصى به</option>
          <option value="middle">منتصف الليل</option>
          <option value="one_seventh">سبع الليل</option>
          <option value="angle">على الأساس الزاوي</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">التذكير قبل الأذان</span>
        <select
          value={settings.reminderLead}
          onChange={e => applySettings({ reminderLead: parseInt(e.target.value, 10) || 0 })}
          className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value={5}>5 دقائق</option>
          <option value={10}>10 دقائق</option>
          <option value={15}>15 دقيقة</option>
          <option value={20}>20 دقيقة</option>
          <option value={30}>30 دقيقة</option>
          <option value={0}>بدون</option>
        </select>
      </label>
    </div>

    {settings.method === 'custom' && (
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">زاوية الفجر</span>
          <input
            type="number" step="0.1"
            value={settings.fajrAngle}
            onChange={e => applySettings({ fajrAngle: parseFloat(e.target.value) || 18 })}
            className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">زاوية العشاء</span>
          <input
            type="number" step="0.1"
            value={settings.ishaAngle}
            onChange={e => applySettings({ ishaAngle: parseFloat(e.target.value) || 17 })}
            className="mt-1 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          />
        </label>
      </div>
    )}

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">تذكير بعد الأذان قبل كل صلاة ({settings.reminderLead} د)</span>
        <Toggle on={settings.reminderEnabled} onChange={() => applySettings({ reminderEnabled: !settings.reminderEnabled })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">الأذان عند دخول الوقت</span>
        <Toggle on={settings.adhanEnabled} onChange={() => applySettings({ adhanEnabled: !settings.adhanEnabled })} />
      </div>
      {settings.adhanEnabled && (
        <div className="flex flex-wrap gap-2">
          {PRAYER_ORDER.map(name => (
            <button
              key={name}
              onClick={() => applySettings({ adhanPerPrayer: { ...settings.adhanPerPrayer, [name]: !settings.adhanPerPrayer[name] } })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                settings.adhanPerPrayer[name]
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-300 border-stone-200 dark:border-stone-700'
              }`}
            >
              {PRAYER_ARABIC[name]}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">تذكير بصلاة الأوابين (الضحى)</span>
        <Toggle on={settings.owabinReminder} onChange={() => applySettings({ owabinReminder: !settings.owabinReminder })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">تذكير ببداية الثلث الأخير من الليل</span>
        <Toggle on={settings.tahajjudReminder} onChange={() => applySettings({ tahajjudReminder: !settings.tahajjudReminder })} />
      </div>
    </div>

    <div className="flex flex-wrap gap-2 pt-1">
      {notifState !== 'granted' && (
        <button
          onClick={requestPerms}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold"
        >
          <Bell className="w-4 h-4" /> تفعيل إشعارات الصلاة
        </button>
      )}
      {notifState === 'granted' && exactState === 'denied' && isAndroidPlatform && (
        <button
          onClick={requestExactPerms}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 text-white px-4 py-2 text-sm font-bold"
        >
          <Bell className="w-4 h-4" /> تفعيل التنبيه الدقيق للأذان
        </button>
      )}
      <button
        onClick={() => {
          playAdhanNow();
          setTimeout(stopAdhan, 15000);
        }}
        className="flex items-center gap-1.5 rounded-xl border border-emerald-600 text-emerald-600 px-4 py-2 text-sm font-bold"
      >
        <Volume2 className="w-4 h-4" /> اختبار الأذان
      </button>
      <button
        onClick={rescheduleNow}
        className="flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 px-4 py-2 text-sm font-bold"
      >
        <RefreshCw className={`w-4 h-4 ${scheduling ? 'animate-spin' : ''}`} /> إعادة جدولة الإشعارات
      </button>
    </div>
    {notifState === 'granted' && exactState === 'denied' && isAndroidPlatform && (
      <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
        لضمان صدور الأذان في موعده بالضبط حتى بعد إغلاق التطبيق، فعّل «التنبيه الدقيق» من إعدادات النظام ثم عُد للتطبيق.
      </p>
    )}
  </div>
);