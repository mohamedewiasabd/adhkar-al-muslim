import { isAndroidPlatform } from './platform';
import nativePlugin from './nativePlugin';

// إشعار «المنبّه الدقيق» ميزة أندرويد فقط؛ على iOS تُعامل كأنها ممنوحة دائمًا.
const exactAlarm = nativePlugin('ExactAlarm');

export async function canScheduleExactAlarms(): Promise<boolean> {
  if (!isAndroidPlatform) return true;
  try {
    if (!exactAlarm.available()) return true;
    const res = await exactAlarm.call<{ granted: boolean }>('canScheduleExactAlarms');
    return res.granted !== false;
  } catch {
    return true;
  }
}

export async function requestExactAlarmPermission(): Promise<boolean> {
  if (!isAndroidPlatform) return true;
  try {
    if (!exactAlarm.available()) return true;
    const res = await exactAlarm.call<{ granted: boolean }>('requestExactAlarmPermission');
    return res.granted !== false;
  } catch {
    return true;
  }
}