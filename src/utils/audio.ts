/**
 * Audio synthesis and haptic feedback utilities for tasbeeh counter and automatic reminders.
 * Pure Web Audio API: 100% offline, zero network delay, pleasant acoustic tones.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a gentle, subtle wooden bead click sound for tasbeeh tap
 */
export function playBeadSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a harmonious bell/chime sound upon completing a dhikr set
 */
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    frequencies.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a peaceful, soft reminder chime for automatic notifications
 */
export function playReminderChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Triggers vibration feedback on supported mobile devices
 */
export function triggerHaptic(duration = 25) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    // Silently ignore if unsupported
  }
}

// ==================== ترتيل/سمع النصوص (TTS) ====================
// يعتمد على محرك الكلام العربي المثبت في الجهاز (SpeechSynthesis) — بدون شبكة، وبلا حجم إضافي.
// ملاحظة: WebView أندرويد يحوّل النص العربي لمنطوق؛ جودة الصوت تتبع محرك النظام.

let speechVoicesLoaded = false;

function loadArabicVoices(): SpeechSynthesisVoice | null {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!speechVoicesLoaded) {
      speechVoicesLoaded = true;
      window.speechSynthesis.onvoiceschanged = () => { /* يلتقط الأصوات عند وصولها */ };
    }
    return voices.find(v => (v.lang || '').toLowerCase().startsWith('ar')) || null;
  } catch {
    return null;
  }
}

/** هل محرك النطق متوفر على هذا الجهاز؟ */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
}

/**
 * ينطق نصاً عربياً بصوت الجهاز. يعيد صحيحاً إذا نجح بدء النطق.
 */
export function speakText(text: string, options: SpeakOptions = {}): boolean {
  try {
    if (!isSpeechSupported() || !text.trim()) return false;
    stopSpeech();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ar-SA';
    utter.rate = options.rate ?? 0.9;
    const arabicVoice = loadArabicVoices();
    if (arabicVoice) utter.voice = arabicVoice;
    if (options.onEnd) utter.onend = () => options.onEnd?.();
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

/** يوقف أي نطق جارٍ فوراً. */
export function stopSpeech() {
  try {
    if (isSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}

let repeatSpeaking = false;

/**
 * «اسمع ثم ردّد» — ينطق النص عدد مرات متتالية (مع إمكانية الإيقاف عبر stopSpeech).
 */
export function speakRepeated(text: string, times: number, onDone?: () => void): boolean {
  if (!isSpeechSupported() || !text.trim() || times < 1) return false;
  stopSpeech();
  let count = 0;
  repeatSpeaking = true;

  const speakOnce = () => {
    if (!repeatSpeaking) return;
    count += 1;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ar-SA';
    utter.rate = 0.9;
    const arabicVoice = loadArabicVoices();
    if (arabicVoice) utter.voice = arabicVoice;
    utter.onend = () => {
      if (count >= times || !repeatSpeaking) {
        repeatSpeaking = false;
        onDone?.();
        return;
      }
      speakOnce();
    };
    window.speechSynthesis.speak(utter);
  };

  try {
    speakOnce();
    return true;
  } catch {
    repeatSpeaking = false;
    return false;
  }
}

/** هل يجري نطق متكرر الآن؟ */
export function isSpeakingRepeated(): boolean {
  return repeatSpeaking;
}
