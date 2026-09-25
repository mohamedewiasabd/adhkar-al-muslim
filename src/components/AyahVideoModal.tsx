import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Palette,
  Volume2,
  Film,
  Check,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { AyahExportData } from './AyahImageModal';
import { triggerHaptic } from '../utils/audio';
import { saveMediaBlob, shareMediaBlob, handleSaveOutcome } from '../utils/imageExport';
import { VIDEO_THEMES, VideoTheme, VideoThemePreset } from '../data/ayahVideoThemes';
import { makeVideoParticles, RECITERS, VideoParticle } from '../utils/videoUtils';
import { drawAyahVideoFrame, VideoAspectRatio } from '../utils/ayahVideoFrame';
import { useAyahVideoRecorder, VideoAudioState } from '../hooks/useAyahVideoRecorder';

interface AyahVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahData: AyahExportData | null;
  onSwitchToImage?: () => void;
}

export const AyahVideoModal: React.FC<AyahVideoModalProps> = ({
  isOpen,
  onClose,
  ayahData,
  onSwitchToImage
}) => {
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Configuration States
  const [themePreset, setThemePreset] = useState<VideoThemePreset>('emerald');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('9:16');
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [includeBasmalah, setIncludeBasmalah] = useState<boolean>(true);

  // Floating background particles
  const particlesRef = useRef<VideoParticle[]>([]);

  const currentTheme: VideoTheme = VIDEO_THEMES[themePreset];

  // Canvas Frame Drawing function
  const drawFrame = useCallback((progressRatio: number = 0, frequencyData?: Uint8Array, audioState?: VideoAudioState) => {
    const canvas = recorder.canvasRef.current;
    if (!canvas || !ayahData) return;
    drawAyahVideoFrame({
      canvas,
      theme: currentTheme,
      aspectRatio,
      surahName: ayahData.surahName,
      surahNumber: ayahData.surahNumber,
      ayahNumber: ayahData.ayahNumber,
      ayahText: ayahData.ayahText,
      reciterName: selectedReciter.name,
      includeBasmalah,
      isPlayingPreview: audioState?.isPlayingPreview ?? false,
      isRecording: audioState?.isRecording ?? false,
      progressRatio,
      frequencyData,
      particles: particlesRef.current,
    });
  }, [aspectRatio, ayahData, currentTheme, includeBasmalah, selectedReciter]);

  // Initialize background star particles
  useEffect(() => {
    particlesRef.current = makeVideoParticles(aspectRatio);
  }, [aspectRatio]);

  // Audio / Video recorder engine
  const recorder = useAyahVideoRecorder({
    isOpen,
    ayahData,
    reciter: selectedReciter,
    drawFrame,
  });

  // Initial render of still frame
  useEffect(() => {
    if (isOpen && ayahData) {
      drawFrame(0);
    }
  }, [isOpen, ayahData, drawFrame]);

  // Download Generated Video
  const handleDownloadVideo = async () => {
    if (!recorder.generatedVideoUrl || !ayahData || !recorder.generatedBlob) return;
    triggerHaptic(25);
    const result = await saveMediaBlob(recorder.generatedBlob, `Quran-${ayahData.surahName}-${ayahData.ayahNumber}`);
    if (result === 'failed') await handleSaveOutcome(result, 'الفيديو');
  };

  // Share Generated Video
  const handleShareVideo = async () => {
    if (!recorder.generatedBlob || !ayahData) return;
    triggerHaptic(25);
    await shareMediaBlob(
      recorder.generatedBlob,
      `Quran-${ayahData.surahName}-${ayahData.ayahNumber}`,
      `فيديو آية: سورة ${ayahData.surahName} (${ayahData.ayahNumber})`,
      `﴿ ${ayahData.ayahText} ﴾ [سورة ${ayahData.surahName}: ${ayahData.ayahNumber}]`
    );
  };

  if (!isOpen || !ayahData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[94vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>تصدير الآية كفيديو مع الصوت</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  جديد
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                سورة {ayahData.surahName} • الآية ({ayahData.ayahNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToImage && (
              <button
                onClick={() => {
                  recorder.stopAllAudio();
                  onSwitchToImage();
                }}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
                title="التبديل إلى تصدير بطاقة صورة ثابتة"
              >
                <span>صورة فقط</span>
              </button>
            )}

            <button
              onClick={() => {
                recorder.stopAllAudio();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">

          {/* Canvas or Video Preview Container */}
          <div className="flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-950 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-inner relative">

            {/* If Video already generated, show HTML5 Video Player */}
            {recorder.generatedVideoUrl ? (
              <div className="w-full flex flex-col items-center gap-2">
                <video
                  ref={videoPreviewRef}
                  src={recorder.generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className={`rounded-xl shadow-lg border border-black/10 object-contain bg-black ${
                    aspectRatio === '9:16' ? 'max-h-[300px] aspect-[9/16]' : 'max-h-[260px] aspect-square'
                  }`}
                />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  تم تجهيز الفيديو بنجاح! يمكنك تشغيله للمعاينة أو تحميله ومشاركته.
                </span>
              </div>
            ) : (
              /* Live Canvas Preview */
              <div className="relative flex justify-center">
                <canvas
                  ref={recorder.canvasRef}
                  className={`rounded-xl shadow-lg border border-black/10 object-contain ${
                    aspectRatio === '9:16'
                      ? 'w-full max-w-[200px] sm:max-w-[230px] aspect-[9/16]'
                      : 'w-full max-w-[240px] sm:max-w-[260px] aspect-square'
                  }`}
                />

                {/* Loading Audio Spinner */}
                {recorder.isLoadingAudio && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center text-white gap-2 p-3 text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold">جارٍ جلب صوت القارئ...</span>
                  </div>
                )}

                {/* Recording Progress Overlay */}
                {recorder.isRecording && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
                    <div className="w-10 h-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
                    <div>
                      <div className="text-sm font-bold text-amber-300">
                        جارٍ تسجيل وتوليد الفيديو...
                      </div>
                      <div className="text-xs text-stone-300 mt-1">
                        {recorder.recordingProgress}% • تلاوة الآية ورسم الموجات
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audio Preview Controls (if not recording and not generated) */}
            {!recorder.isRecording && !recorder.generatedVideoUrl && recorder.audioBuffer && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={recorder.togglePreview}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    recorder.isPlayingPreview
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {recorder.isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{recorder.isPlayingPreview ? 'إيقاف المعاينة' : 'معاينة الصوت مع الحركة'}</span>
                </button>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  مدة التلاوة: {Math.round(recorder.audioBuffer.duration)} ثانية
                </span>
              </div>
            )}

            {recorder.audioError && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{recorder.audioError}</span>
              </div>
            )}
          </div>

          {/* 1. Choose Reciter */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>اختر القارئ الصوتي:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECITERS.map((r) => {
                const isCurrent = selectedReciter.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedReciter(r);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="text-xs leading-relaxed">{r.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Video Aspect Ratio Selection */}
          <div className="grid grid-cols-2 gap-2.5 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>أبعاد الفيديو:</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    setAspectRatio('9:16');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span>9:16 ستوري / ريلز</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    setAspectRatio('1:1');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    aspectRatio === '1:1'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span>1:1 مربع منشور</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300 py-2">
                <input
                  type="checkbox"
                  checked={includeBasmalah}
                  onChange={(e) => setIncludeBasmalah(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>إظهار البسملة في الترويسة</span>
              </label>
            </div>
          </div>

          {/* 3. Theme Palette Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>مظهر ولون خلفية الفيديو:</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(VIDEO_THEMES) as VideoThemePreset[]).map((tKey) => {
                const isCurrent = themePreset === tKey;
                const t = VIDEO_THEMES[tKey];
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      triggerHaptic(15);
                      setThemePreset(tKey);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-xs border border-white/20"
                      style={{ background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.accentColor})` }}
                    />
                    <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300 line-clamp-1">
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3.5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2 justify-between">
          {recorder.generatedVideoUrl ? (
            <>
              <button
                onClick={handleShareVideo}
                className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة الفيديو</span>
              </button>

              <button
                onClick={handleDownloadVideo}
                className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الفيديو HD</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  recorder.resetGenerated();
                }}
                className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                title="إعادة التخصيص أو تسجيل فيديو آخر"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={recorder.startRecording}
              disabled={recorder.isRecording || recorder.isLoadingAudio || !recorder.audioBuffer}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Film className="w-4 h-4" />
              <span>{recorder.isRecording ? `جارٍ تسجيل وتصدير الفيديو (${recorder.recordingProgress}%)...` : 'بدء توليد وتصدير الفيديو بالصوت HD'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};