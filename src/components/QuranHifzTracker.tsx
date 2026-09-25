import React, { useState, useMemo } from 'react';
import { HifzStatus, SurahHifzProgress, SurahMeta } from '../types';
import { surahsList } from '../data/quranMeta';
import { triggerHaptic } from '../utils/audio';
import { useHifzStats } from '../hooks/useHifzStats';
import { HifzDashboard } from './hifz/HifzDashboard';
import { HifzFilters } from './hifz/HifzFilters';
import { SurahHifzCard } from './hifz/SurahHifzCard';
import { EditSurahModal } from './hifz/EditSurahModal';

interface QuranHifzTrackerProps {
  hifzData: Record<number, SurahHifzProgress>;
  onUpdateHifz: (newData: Record<number, SurahHifzProgress>) => void;
  onSelectSurah: (surahNumber: number) => void;
}

export const QuranHifzTracker: React.FC<QuranHifzTrackerProps> = ({
  hifzData,
  onUpdateHifz,
  onSelectSurah
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | HifzStatus>('all');
  const [filterJuz, setFilterJuz] = useState<number | 'all'>('all');
  const [editingSurah, setEditingSurah] = useState<SurahMeta | null>(null);

  const stats = useHifzStats(hifzData);

  const filteredSurahs = useMemo(() => {
    return surahsList.filter((s) => {
      const record = hifzData[s.number];
      const currentStatus: HifzStatus = record ? record.status : 'not_started';

      const matchesSearch =
        s.name.includes(searchQuery.trim()) ||
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(s.number).includes(searchQuery.trim());

      const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;
      const matchesJuz = filterJuz === 'all' || s.juzStart === filterJuz;

      return matchesSearch && matchesStatus && matchesJuz;
    });
  }, [searchQuery, filterStatus, filterJuz, hifzData]);

  const handleStatusChange = (surahNumber: number, newStatus: HifzStatus) => {
    triggerHaptic(20);
    const surah = surahsList.find(s => s.number === surahNumber);
    const existing = hifzData[surahNumber] || {
      surahNumber,
      status: 'not_started',
      memorizedAyahsCount: 0
    };

    const newAyahCount = (newStatus === 'memorized' || newStatus === 'mastered')
      ? (surah?.numberOfAyahs || 0)
      : (newStatus === 'not_started' ? 0 : existing.memorizedAyahsCount || 0);

    const updated: Record<number, SurahHifzProgress> = {
      ...hifzData,
      [surahNumber]: {
        ...existing,
        status: newStatus,
        memorizedAyahsCount: newAyahCount,
        lastReviewedDate: new Date().toISOString().split('T')[0]
      }
    };

    onUpdateHifz(updated);
  };

  const handleSaveEdit = (surahNumber: number, ayahsCount: number, strength: 1 | 2 | 3 | 4 | 5, notes?: string) => {
    triggerHaptic(25);
    const existing = hifzData[surahNumber] || {
      surahNumber,
      status: 'memorizing',
      memorizedAyahsCount: ayahsCount
    };

    const surah = surahsList.find(s => s.number === surahNumber);
    let derivedStatus = existing.status;
    if (surah && ayahsCount >= surah.numberOfAyahs) {
      derivedStatus = 'memorized';
    } else if (ayahsCount > 0) {
      derivedStatus = 'memorizing';
    }

    const updated: Record<number, SurahHifzProgress> = {
      ...hifzData,
      [surahNumber]: {
        ...existing,
        status: derivedStatus,
        memorizedAyahsCount: ayahsCount,
        revisionStrength: strength,
        notes,
        lastReviewedDate: new Date().toISOString().split('T')[0]
      }
    };

    onUpdateHifz(updated);
    setEditingSurah(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <HifzDashboard stats={stats} />

      <HifzFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
        counts={{ all: surahsList.length, memorized: stats.memorizedCount, memorizing: stats.memorizingCount }}
      />

      <div className="space-y-2.5">
        {filteredSurahs.map((surah) => (
          <SurahHifzCard
            key={surah.number}
            surah={surah}
            record={hifzData[surah.number]}
            onStatusChange={handleStatusChange}
            onEdit={setEditingSurah}
            onSelect={onSelectSurah}
          />
        ))}
      </div>

      {editingSurah && (
        <EditSurahModal
          surah={editingSurah}
          existing={hifzData[editingSurah.number]}
          onClose={() => setEditingSurah(null)}
          onSave={(ayahs, strength, notes) => handleSaveEdit(editingSurah.number, ayahs, strength, notes)}
        />
      )}
    </div>
  );
};