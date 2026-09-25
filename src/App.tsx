import React, { useState, useCallback } from 'react';
import { ActiveTab, ReminderSettings } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AdhkarView } from './components/AdhkarView';
import { TasbeehCounter } from './components/TasbeehCounter';
import { DailyWirdView } from './components/DailyWirdView';
import { DuasView } from './components/DuasView';
import { TrackerView } from './components/TrackerView';
import { QuranView } from './components/QuranView';
import { ReminderModal } from './components/ReminderModal';
import { InAppReminderBanner } from './components/InAppReminderBanner';
import { DuaReminderOverlay } from './components/DuaReminderOverlay';
import { ShareModal, SelectedShareable } from './components/ShareModal';
import { OurAppsView } from './components/OurAppsView';
import { WidgetsManagerModal } from './components/WidgetsManagerModal';
import { PrayerTimesView } from './components/PrayerTimesView';
import { initialDuasData } from './data/duasData';
import { surahsList } from './data/quranMeta';
import { bundledQuranSurahs } from './data/bundledQuran';
import {
  loadFontSize,
  saveFontSize
} from './utils/storage';
import { InAppAlert } from './utils/notifications';
import { useAppData } from './hooks/useAppData';
import { useQuranState } from './hooks/useQuranState';
import { useAppEffects } from './hooks/useAppEffects';
import { ShareExplicitType, toSelectedShareable } from './utils/shareMapper';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('adhkar');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_dark_mode_pref_v2');
      if (saved !== null) return saved === 'true';
      // Default to dark mode for comfortable night/eye relaxation
      return window.matchMedia('(prefers-color-scheme: dark)').matches || true;
    }
    return true;
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => loadFontSize());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOurAppsOpen, setIsOurAppsOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<InAppAlert | null>(null);
  const [selectedShareItem, setSelectedShareItem] = useState<SelectedShareable | null>(null);

  const core = useAppData();
  const quran = useQuranState({ onStreakActivity: core.refreshStreak });

  useAppEffects({
    isDarkMode,
    reminderSettings: core.reminderSettings,
    setCurrentAlert
  });

  // Change font size
  const handleChangeFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    saveFontSize(size);
  }, []);

  // Save reminder settings
  const handleSaveReminderSettings = useCallback((settings: ReminderSettings) => {
    core.updateReminderSettings(settings);
  }, [core.updateReminderSettings]);

  // Open Share Modal for Dhikr or Dua or Wird or Quran or general
  const handleOpenShare = useCallback((item?: any, explicitType?: ShareExplicitType) => {
    if (!item) {
      setSelectedShareItem(null);
    } else {
      setSelectedShareItem(toSelectedShareable(item, explicitType));
    }
    setIsShareModalOpen(true);
  }, []);

  const wirdPendingCount = core.wirdList.filter(w => !w.completed && w.current < w.target).length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Periodic in-app timer: «دعاء» منتصف الشاشة كل فترة */}
      <DuaReminderOverlay
        alert={currentAlert && currentAlert.type === 'dua' ? currentAlert : null}
        onDismiss={() => setCurrentAlert(null)}
      />

      {/* Floating In-App Reminder Toast */}
      <InAppReminderBanner
        alert={currentAlert && currentAlert.type !== 'dua' ? currentAlert : null}
        onDismiss={() => setCurrentAlert(null)}
        onQuickCount={() => core.handleIncrementTasbeeh(1)}
      />

      {/* Top Header */}
      <Header
        streak={core.streak}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenReminders={() => setIsReminderModalOpen(true)}
        onOpenShare={() => handleOpenShare()}
        fontSize={fontSize}
        onChangeFontSize={handleChangeFontSize}
        hasActiveReminders={core.reminderSettings.enabled}
      />

      {/* Main View Area */}
      <main className="transition-all duration-150">
        {activeTab === 'adhkar' && (
          <AdhkarView
            adhkar={core.adhkar}
            onUpdateCount={core.handleUpdateAdhkarCount}
            onResetCategory={core.handleResetCategory}
            onOpenShare={handleOpenShare}
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
          />
        )}

        {activeTab === 'prayer' && (
          <PrayerTimesView />
        )}

        {activeTab === 'quran' && (
          <QuranView
            fontSize={fontSize}
            bookmark={quran.quranBookmark}
            onSaveBookmark={quran.handleUpdateQuranBookmark}
            wirdGoal={quran.quranWirdGoal}
            onUpdateWirdGoal={quran.handleUpdateQuranWirdGoal}
            hifzData={quran.hifzProgress}
            onUpdateHifz={quran.handleUpdateHifzProgress}
            onShareAyah={(item) => handleOpenShare(item, 'quran')}
          />
        )}

        {activeTab === 'tasbeeh' && (
          <TasbeehCounter
            totalTasbeehCount={core.totalTasbeeh}
            todayTasbeehCount={core.todayTasbeeh}
            onIncrementTasbeeh={core.handleIncrementTasbeeh}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
          />
        )}

        {activeTab === 'wird' && (
          <DailyWirdView
            wirdList={core.wirdList}
            onToggleWirdItem={core.handleToggleWirdItem}
            onUpdateWirdProgress={core.handleUpdateWirdProgress}
            onAddCustomWird={core.handleAddCustomWird}
            onDeleteWird={core.handleDeleteWird}
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
            onOpenShare={(item) => handleOpenShare(item, 'wird')}
          />
        )}

        {activeTab === 'duas' && (
          <DuasView
            favoriteIds={core.favoriteDuas}
            onToggleFavorite={core.handleToggleFavoriteDua}
            onOpenShare={handleOpenShare}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'stats' && (
          <TrackerView
            streak={core.streak}
            totalTasbeeh={core.totalTasbeeh}
            todayTasbeeh={core.todayTasbeeh}
            wirdCompletionRate={core.wirdCompletionRate}
            morningDone={core.morningDone}
            eveningDone={core.eveningDone}
            achievements={core.achievements}
            history={core.history}
            onOpenOurApps={() => setIsOurAppsOpen(true)}
            onOpenWidgets={() => setIsWidgetsOpen(true)}
          />
        )}
      </main>

      {/* Mobile-Ergonomic Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        wirdPendingCount={wirdPendingCount}
      />

      {/* Auto-Reminder Settings Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={core.reminderSettings}
        onSaveSettings={handleSaveReminderSettings}
      />

      {/* Share Dhikr & Dua Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialItem={selectedShareItem}
        adhkarList={core.adhkar}
        duasList={initialDuasData}
        surahs={surahsList}
        quranBySurah={bundledQuranSurahs}
      />

      {/* Our Apps Page */}
      <OurAppsView isOpen={isOurAppsOpen} onClose={() => setIsOurAppsOpen(false)} />

      {/* Floating Widgets Manager */}
      <WidgetsManagerModal isOpen={isWidgetsOpen} onClose={() => setIsWidgetsOpen(false)} />
    </div>
  );
}