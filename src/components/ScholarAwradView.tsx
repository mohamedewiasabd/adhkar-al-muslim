import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Check,
  Sparkles
} from 'lucide-react';
import { ScholarWirdItem } from '../types';
import { scholarAwradList } from '../data/awradData';
import { loadFavoriteAwrad, saveFavoriteAwrad } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { UniversalImageModal, CardExportData } from './UniversalImageModal';
import { WirdCard } from './awrad/WirdCard';
import { WirdRecitationModal } from './awrad/WirdRecitationModal';
import { ScholarAwradHeader } from './awrad/ScholarAwradHeader';
import { AwradSearchInput } from './awrad/AwradSearchInput';
import { AwradFilterTabs } from './awrad/AwradFilterTabs';
import { AwradFilter, AWARD_FILTER_TABS } from './awrad/awradFilters';

export type { AwradFilter } from './awrad/awradFilters';

interface ScholarAwradViewProps {
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  onToggleSound?: () => void;
  onOpenShare: (item: {
    id: string;
    type: 'wird';
    title: string;
    text: string;
    fadlOrBenefit?: string;
    reference?: string;
    categoryLabel?: string;
  }) => void;
  onAddWirdToDailySchedule: (title: string, description: string, targetCount: number, unit: string) => void;
}

export const ScholarAwradView: React.FC<ScholarAwradViewProps> = ({
  fontSize,
  soundEnabled,
  onToggleSound,
  onOpenShare,
  onAddWirdToDailySchedule
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AwradFilter>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavoriteAwrad());

  // Active reading/recitation modal state
  const [activeWird, setActiveWird] = useState<ScholarWirdItem | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [addedSuccessNotification, setAddedSuccessNotification] = useState<string | null>(null);
  const [imageModalItem, setImageModalItem] = useState<CardExportData | null>(null);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveFavoriteAwrad(next);
      return next;
    });
    triggerHaptic(25);
  };

  // Filter list
  const filteredList = useMemo(() => {
    return scholarAwradList.filter(item => {
      // Filter tab
      if (activeFilter === 'sahaba' && item.category !== 'الصحابة والتابعون') return false;
      if (activeFilter === 'non_sufi' && item.tradition !== 'non_sufi') return false;
      if (activeFilter === 'sufi' && item.tradition !== 'sufi') return false;
      if (activeFilter === 'nawawi' && item.category !== 'الإمام النووي') return false;
      if (activeFilter === 'shadhili' && item.category !== 'السادة الشاذلية') return false;
      if (activeFilter === 'haddad' && !item.category.includes('باعلوي')) return false;
      if (activeFilter === 'ghazali' && item.category !== 'الإمام الغزالي') return false;
      if (activeFilter === 'favorites' && !favoriteIds.includes(item.id)) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesScholar = item.scholar.toLowerCase().includes(q);
        const matchesDesc = item.shortDescription.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesTitle || matchesScholar || matchesDesc || matchesCat;
      }
      return true;
    });
  }, [activeFilter, searchQuery, favoriteIds]);

  const handleOpenWird = (wird: ScholarWirdItem) => {
    setActiveWird(wird);
    triggerHaptic(20);
  };

  const handleCopyFullText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    triggerHaptic(20);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleAddWird = (wird: ScholarWirdItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onAddWirdToDailySchedule(
      wird.title,
      `من أوراد ${wird.scholar}`,
      wird.sections.length > 0 ? wird.sections.length : 1,
      'أقسام'
    );
    setAddedSuccessNotification(wird.title);
    triggerHaptic(40);
    setTimeout(() => setAddedSuccessNotification(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      {copiedNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم نسخ نص الورد كاملاً إلى الحافظة</span>
        </div>
      )}

      {addedSuccessNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>تمت إضافة «{addedSuccessNotification}» إلى جدول وردك اليومي بنجاح!</span>
        </div>
      )}

      {/* Intro Header Banner */}
      <ScholarAwradHeader count={filteredList.length} />

      {/* Search Input */}
      <AwradSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Filter Tabs / Pills */}
      <AwradFilterTabs
        filters={AWARD_FILTER_TABS}
        active={activeFilter}
        favoritesCount={favoriteIds.length}
        onSelect={setActiveFilter}
      />

      {/* Awrad Cards Grid */}
      <div className="space-y-3">
        {filteredList.map((wird) => (
          <WirdCard
            key={wird.id}
            wird={wird}
            isFavorite={favoriteIds.includes(wird.id)}
            onOpen={handleOpenWird}
            onToggleFavorite={toggleFavorite}
            onExportImage={(w, e) => {
              e.stopPropagation();
              setImageModalItem({
                title: w.title,
                categoryLabel: w.scholar,
                text: w.sections[0]?.text || w.fullText.slice(0, 300),
                fadlOrBenefit: w.shortDescription,
                reference: w.sourceReference,
                type: 'wird'
              });
            }}
            onAddToDaily={handleAddWird}
          />
        ))}

        {filteredList.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-sm font-semibold">لم يتم العثور على أوراد مطابقة للبحث</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
            >
              عرض جميع الأوراد
            </button>
          </div>
        )}
      </div>

      {/* Active Wird Full Modal / Reciter */}
      {activeWird && (
        <WirdRecitationModal
          wird={activeWird}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          isFavorite={favoriteIds.includes(activeWird.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setActiveWird(null)}
          onCopyFullText={handleCopyFullText}
          onShare={(w) => {
            onOpenShare({
              id: w.id,
              type: 'wird',
              title: w.title,
              text: w.fullText.slice(0, 400) + '...',
              fadlOrBenefit: w.shortDescription,
              reference: w.sourceReference,
              categoryLabel: w.scholar
            });
          }}
          onExportImage={(w, text) => {
            setImageModalItem({
              title: w.title,
              categoryLabel: w.scholar,
              text,
              fadlOrBenefit: w.shortDescription,
              reference: w.sourceReference,
              type: 'wird'
            });
          }}
          onAddToDaily={handleAddWird}
          fontSize={fontSize}
        />
      )}

      {/* Direct Universal Image Export Modal */}
      {imageModalItem && (
        <UniversalImageModal
          isOpen={!!imageModalItem}
          onClose={() => setImageModalItem(null)}
          data={imageModalItem}
        />
      )}
    </div>
  );
};