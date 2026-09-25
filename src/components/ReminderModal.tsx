import React from 'react';
import { X, Bell, Volume2, Smartphone, Sparkles, Check, AlarmClock, BatteryCharging } from 'lucide-react';
import { ReminderSettings } from '../types';
import { isAndroidPlatform } from '../utils/platform';
import { useReminderSettings } from '../hooks/useReminderSettings';
import { ToggleSwitch } from './reminder/ToggleSwitch';
import { PermissionStatusCard } from './reminder/PermissionStatusCard';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onSaveSettings: (settings: ReminderSettings) => void;
}

const intervals = [
  { value: 15, label: 'كل 15 دقيقة' },
  { value: 30, label: 'كل 30 دقيقة' },
  { value: 60, label: 'كل ساعة' },
  { value: 120, label: 'كل ساعتين' },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const r = useReminderSettings(isOpen, settings, onSaveSettings);

  if (!isOpen) return null;

  const systemBadgeClass =
    r.systemStatus === 'granted'
      ? 'bg-emerald-600 text-white'
      : r.systemStatus === 'denied'
      ? 'bg-red-500 text-white'
      : r.systemStatus === 'unsupported'
      ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
      : 'bg-amber-500 text-white';

  const systemBadgeLabel =
    r.systemStatus === 'granted'
      ? 'مفعلة ✓'
      : r.systemStatus === 'denied'
      ? 'محظورة — فعّل من إعدادات النظام'
      : r.systemStatus === 'unsupported'
      ? 'غير مدعومة'
      : 'بانتظار الموافقة';

  const exactBadgeClass =
    r.exactAlarmStatus === 'granted'
      ? 'bg-emerald-600 text-white'
      : r.exactAlarmStatus === 'unsupported'
      ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
      : 'bg-amber-500 text-white';

  const exactBadgeLabel =
    r.exactAlarmStatus === 'granted'
      ? 'المواعيد الدقيقة مفعلة ✓'
      : r.exactAlarmStatus === 'unsupported'
      ? 'غير مطلوبة على هذا الجهاز'
      : 'تحتاج تفعيلاً من إعدادات النظام';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              إعدادات التنبيه التلقائي
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              تذكير دوري بذكر الله ودعاء الأوقات — يظهر كإشعار على هاتفك حتى عند إغلاق التطبيق
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between mb-4">
          <div>
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
              تفعيل التنبيهات الدورية
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              تذكير لطيف بذكر وتسبيحة طوال اليوم
            </span>
          </div>

          <ToggleSwitch
            on={r.localSettings.enabled}
            onChange={r.toggleEnable}
            large
            id="btn-toggle-auto-reminder"
          />
        </div>

        {/* Interval Selection */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
            فترة التكرار للذكر التلقائي
          </label>
          <div className="grid grid-cols-2 gap-2">
            {intervals.map((item) => (
              <button
                key={item.value}
                onClick={() => r.intervalChange(item.value)}
                disabled={!r.localSettings.enabled}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  r.localSettings.intervalMinutes === item.value && r.localSettings.enabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 disabled:opacity-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Daily Times (Morning / Evening) */}
        <div className="mb-4 space-y-2.5">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            أوقات أذكار الصباح والمساء
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="block text-[11px] text-stone-500 font-medium mb-1">
                وقت أذكار الصباح ☀️
              </span>
              <input
                type="time"
                value={r.localSettings.morningTime}
                onChange={(e) => r.timeChange('morningTime', e.target.value)}
                className="w-full bg-white dark:bg-stone-900 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="block text-[11px] text-stone-500 font-medium mb-1">
                وقت أذكار المساء 🌙
              </span>
              <input
                type="time"
                value={r.localSettings.eveningTime}
                onChange={(e) => r.timeChange('eveningTime', e.target.value)}
                className="w-full bg-white dark:bg-stone-900 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Qiyam al-Layl Reminder — إشعار قبل قيام الليل بنصف ساعة */}
        <div className="mb-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>تذكير قيام الليل 🔑</span>
            </div>
            <ToggleSwitch on={r.localSettings.qiyamEnabled} onChange={r.toggleQiyam} id="btn-toggle-qiyam-reminder" />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
            يصل إليك إشعارٌ بمفاتيح قيام الليل قبل الموعد الذي تحدده بنصف ساعة، لتستعدَّ لصلاة الليل بذكر الله.
          </p>
          <div className="mt-2 p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-indigo-100 dark:border-indigo-900/40">
            <span className="block text-[11px] text-stone-500 font-medium mb-1">
              وقت قيام الليل المقصود 🌌
            </span>
            <input
              type="time"
              value={r.localSettings.qiyamTime}
              onChange={(e) => r.qiyamTimeChange(e.target.value)}
              disabled={!r.localSettings.qiyamEnabled}
              className="w-full bg-stone-50 dark:bg-stone-900 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none disabled:opacity-50"
            />
            <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 rounded-lg px-2.5 py-1.5">
              سيصلك التنبيه في الساعة {(function() {
                const [h, m] = (r.localSettings.qiyamTime || '03:00').split(':').map(Number);
                let t = h * 60 + m - 30;
                if (t < 0) t += 1440;
                return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
              })()} — أي قبل القيام بنصف ساعة
            </div>
          </div>
        </div>

        {/* Tone and Vibration Toggles */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Volume2 className="w-4 h-4 text-stone-500" />
              <span>نغمة رقيقة هادئة مع التنبيه</span>
            </div>
            <ToggleSwitch on={r.localSettings.soundEnabled} onChange={r.toggleSound} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Smartphone className="w-4 h-4 text-stone-500" />
              <span>اهتزاز خفيف للهاتف (Haptic)</span>
            </div>
            <ToggleSwitch on={r.localSettings.vibrateEnabled} onChange={r.toggleVibrate} />
          </div>
        </div>

        {/* Notification Permission Request */}
        <div className="mb-4 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-stone-800 dark:text-stone-200 block">
              إشعارات المتصفح
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {r.notificationStatus === 'granted' ? 'مفعلة بنجاح ✓' : 'تلقي إشعار حتى لو لم تكن داخل الصفحة'}
            </span>
          </div>

          {r.notificationStatus !== 'granted' && (
            <button
              onClick={r.requestPermission}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              طلب الإذن
            </button>
          )}
        </div>

        {/* Native System Notification Permission (works when the app is closed) */}
        {r.isNative && (
          <PermissionStatusCard
            cardClass="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50"
            icon={<Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            title="إشعارات النظام — تعمل بعد إغلاق التطبيق"
            description="تصلك أذكار الصباح والمساء والذكر الدوري كإشعار كامل على هاتفك حتى لو كان التطبيق مغلقاً أو في الخلفية، فتقرؤها دون فتح التطبيق."
            badgeClass={systemBadgeClass}
            badgeLabel={systemBadgeLabel}
            actionLabel={r.systemStatus !== 'granted' && r.systemStatus !== 'unsupported' ? 'تفعيل إشعارات النظام' : undefined}
            actionClass="bg-emerald-600 hover:bg-emerald-700"
            onAction={r.systemStatus !== 'granted' && r.systemStatus !== 'unsupported' ? r.systemPermission : undefined}
          />
        )}

        {/* Exact Alarm Permission (timed reminders fire on time on Android 12+) — أندرويد فقط */}
        {isAndroidPlatform && (
          <PermissionStatusCard
            cardClass="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50"
            icon={<AlarmClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            title="دقة المواعيد (منبّهات دقيقة)"
            description="ضرورية ليصلك ذكرُ الصباح/المساء والذكر الدوري في موعده تماماً. في أندرويد 12+ أذونات &quot;إشعارات النظام&quot; وحدها لا تكفي؛ يجب السماح بـ&quot;التنبيهات والتذكيرات الدقيقة&quot; من إعدادات النظام."
            badgeClass={exactBadgeClass}
            badgeLabel={exactBadgeLabel}
            actionLabel={r.exactAlarmStatus === 'denied' ? 'السماح بالمنبّهات الدقيقة' : undefined}
            actionClass="bg-amber-500 hover:bg-amber-600"
            onAction={r.exactAlarmStatus === 'denied' ? r.exactAlarmSettings : undefined}
          />
        )}

        {/* Battery Optimization Exemption (Android OEM phones block scheduled alarms) — أندرويد فقط */}
        {isAndroidPlatform && (
          <PermissionStatusCard
            cardClass="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/50"
            icon={<BatteryCharging className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            title="استمرار عمل التذكير بعد الإغلاق (البطارية)"
            description="على بعض الهواتف (Xiaomi، Huawei، Oppo...) يوقف Android إشعارات الوقت إذا لم يُعفَ التطبيق من &quot;تحسين استهلاك البطارية&quot; — هذا أهم سبب لعدم وصول أذكار الصباح/المساء المجدولة مع أن الاختبار الفوري يصل."
            badgeClass={r.batteryExempt ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}
            badgeLabel={r.batteryExempt ? 'معفى من تحسين البطارية ✓' : 'تحتاج منح الإعفاء'}
            actionLabel={!r.batteryExempt ? 'السماح بالعمل دون رقابة البطارية' : undefined}
            actionClass="bg-blue-600 hover:bg-blue-700"
            onAction={!r.batteryExempt ? r.batteryExemption : undefined}
          />
        )}

        {/* Test Alert Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={r.testNotification}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            {r.testSent || r.systemTestSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم إرسال التنبيه التجريبي!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تجربة التنبيه الآن</span>
              </>
            )}
          </button>

          <button
            onClick={r.testDuaOverlay}
            id="btn-test-dua-overlay"
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            {r.duaOverlayTestSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>ظهر الدعاء!</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>معاينة الدعاء</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};