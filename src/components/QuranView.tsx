import React, { useState } from 'react';
import { BookmarkCheck } from 'lucide-react';
import { QuranBookmark, QuranReadingWirdGoal, AyahItem, SurahHifzProgress } from '../types';
import { QuranWirdTracker } from './QuranWirdTracker';
import { QuranHifzTracker } from './QuranHifzTracker';
import { AyahImageModal, AyahExportData } from './AyahImageModal';
import { AyahVideoModal } from './AyahVideoModal';
import { triggerHaptic } from '../utils/audio';
import { useQuranReader } from '../hooks/useQuranReader';
import { QuranSubTabs, QuranSubTab } from './quran/QuranSubTabs';
import { QuranIndexView, QuranIndexMode } from './quran/QuranIndexView';
import { QuranReaderView } from './quran/QuranReaderView';

interface QuranViewProps {
  fontSize: 'small' | 'medium' | 'large';
  bookmark: QuranBookmark | null;
  onSaveBookmark: (bookmark: QuranBookmark | null) => void;
  wirdGoal: QuranReadingWirdGoal;
  onUpdateWirdGoal: (newGoal: QuranReadingWirdGoal) => void;
  hifzData: Record<number, SurahHifzProgress>;
  onUpdateHifz: (newData: Record<number, SurahHifzProgress>) => void;
  onShareAyah?: (item: QuranShareItem) => void;
}

export interface QuranShareItem {
  id: string;
  type: 'quran';
  title: string;
  text: string;
  reference?: string;
  categoryLabel?: string;
}

export const QuranView: React.FC<QuranViewProps> = ({
  fontSize,
  bookmark,
  onSaveBookmark,
  wirdGoal,
  onUpdateWirdGoal,
  hifzData,
  onUpdateHifz,
  onShareAyah
}) => {
  const reader = useQuranReader({ bookmark, onSaveBookmark, wirdGoal, onUpdateWirdGoal });

  const [subTab, setSubTab] = useState<QuranSubTab>('read');
  const [searchQuery, setSearchQuery] = useState('');
  const [indexMode, setIndexMode] = useState<QuranIndexMode>('surahs');

  const handleSelectSurah = (surahNumber: number) => {
    reader.handleSelectSurah(surahNumber);
    setSubTab('read');
  };

  const handlePlatformShareAyah = (item: AyahItem) => {
    triggerHaptic(20);
    onShareAyah?.({
      id: `q-${reader.currentSurah.number}-${item.numberInSurah}`,
      type: 'quran',
      title: `سورة ${reader.currentSurah.name}`,
      text: item.text,
      reference: `الآية ${item.numberInSurah} • صفحة ${item.page} • جزء ${item.juz}`,
      categoryLabel: 'القرآن الكريم'
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12" dir="rtl">
      {/* 1. Quran Navigation Sub-Bar */}
      <QuranSubTabs subTab={subTab} onChange={setSubTab} />

      {/* 2. SUB-VIEW: Quran Index */}
      {subTab === 'index' && (
        <QuranIndexView
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          indexMode={indexMode}
          onIndexModeChange={setIndexMode}
          bookmark={bookmark}
          selectedSurahNumber={reader.selectedSurahNumber}
          hifzData={hifzData}
          onSelectSurah={handleSelectSurah}
        />
      )}

      {/* 3. SUB-VIEW: Daily Reading Wird Tracker */}
      {subTab === 'wird' && (
        <QuranWirdTracker
          wirdGoal={wirdGoal}
          onUpdateGoal={onUpdateWirdGoal}
          bookmark={bookmark}
          onJumpToBookmark={() => {
            if (bookmark) {
              handleSelectSurah(bookmark.surahNumber);
            }
          }}
          onSelectSurah={handleSelectSurah}
        />
      )}

      {/* 4. SUB-VIEW: Hifz Memorization Tracker */}
      {subTab === 'hifz' && (
        <QuranHifzTracker
          hifzData={hifzData}
          onUpdateHifz={onUpdateHifz}
          onSelectSurah={handleSelectSurah}
        />
      )}

      {/* 5. SUB-VIEW: Quran Reader */}
      {subTab === 'read' && (
        <QuranReaderView
          surah={reader.currentSurah}
          surahNumber={reader.selectedSurahNumber}
          surahAyahs={reader.surahAyahs}
          isLoadingAyahs={reader.isLoadingAyahs}
          apiError={reader.apiError}
          playingAyah={reader.playingAyah}
          copiedAyahNumber={reader.copiedAyahNumber}
          bookmark={bookmark}
          fontSize={fontSize}
          canShare={Boolean(onShareAyah)}
          onPrev={reader.handlePrevSurah}
          onNext={reader.handleNextSurah}
          onOpenIndex={() => setSubTab('index')}
          onRetry={() => reader.handleSelectSurah(reader.selectedSurahNumber)}
          onToggleAudio={reader.handleToggleAudio}
          onCopy={reader.handleCopyAyah}
          onOpenVideo={reader.handleOpenVideoModal}
          onOpenImage={reader.handleOpenExportModal}
          onPlatformShare={handlePlatformShareAyah}
          onToggleBookmark={reader.handleToggleBookmark}
        />
      )}

      {/* 6. Ayah Beautiful Image Export Modal */}
      <AyahImageModal
        isOpen={reader.exportModalOpen}
        onClose={() => {
          reader.setExportModalOpen(false);
          reader.setSelectedExportAyah(null);
        }}
        ayahData={reader.selectedExportAyah}
        onSwitchToVideo={() => {
          reader.setExportModalOpen(false);
          reader.setExportVideoModalOpen(true);
        }}
      />

      {/* 7. Ayah Video with Audio Export Modal */}
      <AyahVideoModal
        isOpen={reader.exportVideoModalOpen}
        onClose={() => {
          reader.setExportVideoModalOpen(false);
          reader.setSelectedExportAyah(null);
        }}
        ayahData={reader.selectedExportAyah}
        onSwitchToImage={() => {
          reader.setExportVideoModalOpen(false);
          reader.setExportModalOpen(true);
        }}
      />
    </div>
  );
};