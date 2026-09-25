import { useState, useEffect, useMemo, useRef } from 'react';
import { AyahItem, QuranBookmark, QuranReadingWirdGoal, SurahMeta } from '../types';
import { surahsList } from '../data/quranMeta';
import { bundledQuranSurahs } from '../data/bundledQuran';
import { triggerHaptic } from '../utils/audio';
import { AyahExportData } from '../components/AyahImageModal';

interface UseQuranReaderOptions {
  bookmark: QuranBookmark | null;
  onSaveBookmark: (bookmark: QuranBookmark | null) => void;
  wirdGoal: QuranReadingWirdGoal;
  onUpdateWirdGoal: (newGoal: QuranReadingWirdGoal) => void;
}

/** منطق القارئ: جلب الآيات، التصفح بين السور، العلامة، النسخ، التصدير والتلاوة. */
export const useQuranReader = ({
  bookmark,
  onSaveBookmark,
  wirdGoal,
  onUpdateWirdGoal
}: UseQuranReaderOptions) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    return bookmark?.surahNumber || wirdGoal?.lastReadSurah || 1;
  });

  const [surahAyahs, setSurahAyahs] = useState<AyahItem[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportVideoModalOpen, setExportVideoModalOpen] = useState(false);
  const [selectedExportAyah, setSelectedExportAyah] = useState<AyahExportData | null>(null);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah: SurahMeta = useMemo(() => {
    return surahsList.find(s => s.number === selectedSurahNumber) || surahsList[0];
  }, [selectedSurahNumber]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingAyahs(true);
    setApiError(null);

    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
    }

    if (bundledQuranSurahs[selectedSurahNumber]) {
      setSurahAyahs(bundledQuranSurahs[selectedSurahNumber].ayahs);
      setIsLoadingAyahs(false);
      return;
    }

    const fetchSurah = async () => {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/quran-uthmani`);
        if (!response.ok) {
          throw new Error('فشل جلب نص السورة');
        }
        const data = await response.json();
        if (isMounted && data?.data?.ayahs) {
          const loadedAyahs: AyahItem[] = data.data.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            juz: a.juz,
            page: a.page,
            sajda: Boolean(a.sajda)
          }));
          setSurahAyahs(loadedAyahs);
        }
      } catch (err: any) {
        if (isMounted) {
          setApiError('تعذر جلب نص السورة عبر الإنترنت حالياً، يرجى التأكد من الاتصال.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingAyahs(false);
        }
      }
    };

    fetchSurah();

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  const handleSelectSurah = (surahNumber: number) => {
    triggerHaptic(20);
    setSelectedSurahNumber(surahNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextSurah = () => {
    if (selectedSurahNumber < 114) {
      handleSelectSurah(selectedSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahNumber > 1) {
      handleSelectSurah(selectedSurahNumber - 1);
    }
  };

  const handleToggleBookmark = (ayah: AyahItem) => {
    triggerHaptic(25);
    const isCurrentBookmark =
      bookmark?.surahNumber === currentSurah.number &&
      bookmark?.ayahNumber === ayah.numberInSurah;

    if (isCurrentBookmark) {
      onSaveBookmark(null);
    } else {
      onSaveBookmark({
        surahNumber: currentSurah.number,
        surahName: currentSurah.name,
        ayahNumber: ayah.numberInSurah,
        ayahTextSnippet: ayah.text.slice(0, 80),
        updatedAt: new Date().toISOString()
      });

      onUpdateWirdGoal({
        ...wirdGoal,
        lastReadSurah: currentSurah.number,
        lastReadAyah: ayah.numberInSurah,
        lastReadPage: ayah.page || currentSurah.pageStart
      });
    }
  };

  const handleCopyAyah = async (ayah: AyahItem) => {
    triggerHaptic(20);
    const formatted = `﴿ ${ayah.text} ﴾ [سورة ${currentSurah.name}: ${ayah.numberInSurah}]`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedAyahNumber(ayah.numberInSurah);
      setTimeout(() => setCopiedAyahNumber(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenExportModal = (ayah: AyahItem) => {
    triggerHaptic(20);
    setSelectedExportAyah({
      surahName: currentSurah.name,
      surahNumber: currentSurah.number,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text
    });
    setExportModalOpen(true);
  };

  const handleOpenVideoModal = (ayah: AyahItem) => {
    triggerHaptic(20);
    setSelectedExportAyah({
      surahName: currentSurah.name,
      surahNumber: currentSurah.number,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text
    });
    setExportVideoModalOpen(true);
  };

  const handleToggleAudio = (ayah: AyahItem) => {
    triggerHaptic(20);
    if (playingAyah === ayah.number) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.play().then(() => {
      setPlayingAyah(ayah.number);
    }).catch(() => {
      setPlayingAyah(null);
    });

    audio.onended = () => {
      setPlayingAyah(null);
    };
  };

  return {
    selectedSurahNumber,
    setSelectedSurahNumber,
    currentSurah,
    surahAyahs,
    isLoadingAyahs,
    apiError,
    playingAyah,
    copiedAyahNumber,
    exportModalOpen,
    exportVideoModalOpen,
    selectedExportAyah,
    handleSelectSurah,
    handleNextSurah,
    handlePrevSurah,
    handleToggleBookmark,
    handleCopyAyah,
    handleOpenExportModal,
    handleOpenVideoModal,
    handleToggleAudio,
    setExportModalOpen,
    setExportVideoModalOpen,
    setSelectedExportAyah
  };
};