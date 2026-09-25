import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/audio';
import { getSupportedVideoMimeType, ReciterInfo } from '../utils/videoUtils';

export interface AyahVideoAyah {
  surahNumber: number;
  ayahNumber: number;
}

export interface VideoAudioState {
  isPlayingPreview: boolean;
  isRecording: boolean;
}

interface UseAyahVideoRecorderOptions {
  isOpen: boolean;
  ayahData: AyahVideoAyah | null;
  reciter: ReciterInfo;
  drawFrame: (progressRatio?: number, frequencyData?: Uint8Array, audioState?: VideoAudioState) => void;
}

/**
 * محرّك جلب تلاوة الآية وتشغيلها وتسجيلها من اللوحة (Canvas) إلى فيديو —
 * يفصل منطق الصوت/التسجيل عن واجهة النافذة المنبثقة.
 */
export function useAyahVideoRecorder({ isOpen, ayahData, reciter, drawFrame }: UseAyahVideoRecorderOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const stopAllAudio = useCallback(() => {
    if (activeSourceNodeRef.current) {
      try {
        activeSourceNodeRef.current.stop();
      } catch {
        // already stopped
      }
      activeSourceNodeRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    setIsPlayingPreview(false);
    setIsRecording(false);
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      setGeneratedVideoUrl(null);
      setGeneratedBlob(null);
      setExportSuccess(false);
    }
  }, [isOpen, stopAllAudio]);

  // Load verse audio on ayah or reciter change
  useEffect(() => {
    if (!isOpen || !ayahData) return;

    let isCancelled = false;
    stopAllAudio();
    setAudioBuffer(null);
    setIsLoadingAudio(true);
    setAudioError(null);
    setGeneratedVideoUrl(null);
    setGeneratedBlob(null);

    const padSurah = String(ayahData.surahNumber).padStart(3, '0');
    const padAyah = String(ayahData.ayahNumber).padStart(3, '0');
    const audioUrl = `https://verses.quran.com/${reciter.folder}/${padSurah}${padAyah}.mp3`;

    const fetchAudio = async () => {
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error('تعذر تحميل ملف التلاوة الصوتية');
        }
        const arrayBuf = await response.arrayBuffer();
        if (isCancelled) return;

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }

        const decoded = await audioCtxRef.current.decodeAudioData(arrayBuf);
        if (!isCancelled) {
          setAudioBuffer(decoded);
          setIsLoadingAudio(false);
        }
      } catch {
        if (!isCancelled) {
          setIsLoadingAudio(false);
          setAudioError('تعذر جلب التلاوة الصوتية، يرجى التحقق من اتصال الإنترنت.');
        }
      }
    };

    fetchAudio();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, ayahData, reciter, stopAllAudio]);

  // Audio Preview Play / Pause
  const togglePreview = useCallback(() => {
    if (!audioBuffer || !audioCtxRef.current) return;
    triggerHaptic(20);

    if (isPlayingPreview) {
      stopAllAudio();
      drawFrame(0, undefined, { isPlayingPreview: false, isRecording: false });
      return;
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserNodeRef.current = analyser;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    activeSourceNodeRef.current = source;
    playbackStartTimeRef.current = ctx.currentTime;
    setIsPlayingPreview(true);

    const freqData = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      if (!activeSourceNodeRef.current) return;
      const elapsed = ctx.currentTime - playbackStartTimeRef.current;
      const progress = Math.min(1, elapsed / audioBuffer.duration);

      analyser.getByteFrequencyData(freqData);
      drawFrame(progress, freqData, { isPlayingPreview: true, isRecording: false });

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    source.onended = () => {
      setIsPlayingPreview(false);
      activeSourceNodeRef.current = null;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      drawFrame(0, undefined, { isPlayingPreview: false, isRecording: false });
    };

    source.start(0);
    animFrameIdRef.current = requestAnimationFrame(animate);
  }, [audioBuffer, isPlayingPreview, stopAllAudio, drawFrame]);

  // Start Video Generation & Recording
  const startRecording = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || !audioCtxRef.current) return;

    triggerHaptic(30);
    stopAllAudio();
    setGeneratedVideoUrl(null);
    setGeneratedBlob(null);
    setIsRecording(true);
    setRecordingProgress(0);
    setExportSuccess(false);

    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserNodeRef.current = analyser;

      const mediaStreamDest = ctx.createMediaStreamDestination();
      source.connect(analyser);
      analyser.connect(mediaStreamDest);
      analyser.connect(ctx.destination);

      activeSourceNodeRef.current = source;

      const canvasStream = canvas.captureStream(30);

      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...mediaStreamDest.stream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const supported = getSupportedVideoMimeType();
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: supported.mime,
        videoBitsPerSecond: 2500000
      });
      mediaRecorderRef.current = recorder;

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: supported.mime });
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedBlob(videoBlob);
        setGeneratedVideoUrl(videoUrl);
        setIsRecording(false);
        setExportSuccess(true);
        triggerHaptic(40);
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        drawFrame(1, undefined, { isPlayingPreview: false, isRecording: false });
      };

      playbackStartTimeRef.current = ctx.currentTime;
      recorder.start(100);
      source.start(0);

      const freqData = new Uint8Array(analyser.frequencyBinCount);

      const animateRecord = () => {
        if (!activeSourceNodeRef.current) return;
        const elapsed = ctx.currentTime - playbackStartTimeRef.current;
        const progress = Math.min(1, elapsed / audioBuffer.duration);
        setRecordingProgress(Math.round(progress * 100));

        analyser.getByteFrequencyData(freqData);
        drawFrame(progress, freqData, { isPlayingPreview: false, isRecording: true });

        if (progress < 1) {
          animFrameIdRef.current = requestAnimationFrame(animateRecord);
        }
      };

      source.onended = () => {
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          activeSourceNodeRef.current = null;
        }, 300);
      };

      animFrameIdRef.current = requestAnimationFrame(animateRecord);

    } catch (err: any) {
      setIsRecording(false);
      alert('حدث خطأ أثناء تصدير الفيديو: ' + (err?.message || 'المتصفح لا يدعم تسجيل الفيديو مباشرة'));
    }
  }, [audioBuffer, drawFrame, stopAllAudio]);

  const resetGenerated = useCallback(() => {
    setGeneratedVideoUrl(null);
    setGeneratedBlob(null);
  }, []);

  return {
    canvasRef,
    audioBuffer,
    isLoadingAudio,
    audioError,
    isPlayingPreview,
    isRecording,
    recordingProgress,
    generatedVideoUrl,
    generatedBlob,
    exportSuccess,
    stopAllAudio,
    togglePreview,
    startRecording,
    resetGenerated,
  };
}