import {
  Coordinates,
  HighLatitudeRule,
  PrayerTimes,
  SunnahTimes,
} from 'adhan';
import { DailyPrayerTimes, PrayerSettings } from './types';
import { buildParameters } from './methods';
import { fmtWall } from './wall';
import { addMinutesToHM, dateKey } from './fmt';
import { normalizeTimezone } from './tz';

export function computePrayerTimes(date: Date, settings: PrayerSettings): DailyPrayerTimes {
  const tz = normalizeTimezone(settings.tz, settings);
  const coords = new Coordinates(settings.lat, settings.lng);
  const params = buildParameters(settings);

  switch (settings.highLats) {
    case 'middle':
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
      break;
    case 'one_seventh':
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
      break;
    case 'angle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    default:
      params.highLatitudeRule = HighLatitudeRule.recommended(coords);
      break;
  }

  const pt = new PrayerTimes(coords, date, params);
  const sunnah = new SunnahTimes(pt);

  const dhuhr = fmtWall(pt.dhuhr, tz);

  return {
    date: dateKey(date),
    imsak: fmtWall(pt.fajr, tz),
    fajr: fmtWall(pt.fajr, tz),
    sunrise: fmtWall(pt.sunrise, tz),
    dhuhr,
    owabin: addMinutesToHM(dhuhr, -60),
    asr: fmtWall(pt.asr, tz),
    maghrib: fmtWall(pt.maghrib, tz),
    isha: fmtWall(pt.isha, tz),
    midnight: sunnah ? fmtWall(sunnah.middleOfTheNight, tz) : '',
    lastThird: sunnah ? fmtWall(sunnah.lastThirdOfTheNight, tz) : '',
  };
}