import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DhikrCategory, DhikrItem } from '../types';
import { playBeadSound, playCompletionChime, triggerHaptic } from '../utils/audio';
import { UniversalImageModal, CardExportData } from './UniversalImageModal';
import { AdsFeedSlot } from './AdsFeedSlot';
import { buildAdhkarSpec } from '../utils/widgets';
import confetti from 'canvas-confetti';
import { AdhkarCategoryPills, AdhkarCategoryInfo } from './adhkar/AdhkarCategoryPills';
import { CategoryOverviewCard } from './adhkar/CategoryOverviewCard';
import { DhikrCard } from './adhkar/DhikrCard';

interface AdhkarViewProps {
  adhkar: DhikrItem[];
  onUpdateCount: (id: string, newCount: number) => void;
  onResetCategory: (category: DhikrCategory) => void;
  onOpenShare: (item?: DhikrItem) => void;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const categories: AdhkarCategoryInfo[] = [
  { id: 'morning', label: 'أذكار الصباح', icon: '☀️' },
  { id: 'evening', label: 'أذكار المساء', icon: '🌙' },
  { id: 'sleep', label: 'أذكار النوم', icon: '🛌' },
  { id: 'wake', label: 'الاستيقاظ', icon: '🌅' },
  { id: 'after_prayer', label: 'بعد الصلاة', icon: '🕌' },
  { id: 'masjid', label: 'المسجد والأذان', icon: '🕋' },
  { id: 'home', label: 'المنزل والخلاء', icon: '🏡' },
  { id: 'wudu', label: 'الوضوء والطهارة', icon: '💧' },
  { id: 'food', label: 'الطعام واللباس', icon: '🍽️' },
  { id: 'day_night', label: 'أذكار اليوم والليلة', icon: '✨' },
  { id: 'stress', label: 'الهم والحزن والكرب', icon: '😔' },
  { id: 'travel', label: 'السفر والركوب', icon: '🚗' },
  { id: 'weather', label: 'المطر والرعد والريح', icon: '🌧️' },
  { id: 'qiyam', label: 'مفاتيح قيام الليل', icon: '🔑' },
];

export const AdhkarView: React.FC<AdhkarViewProps> = ({
  adhkar,
  onUpdateCount,
  onResetCategory,
  onOpenShare,
  fontSize,
  soundEnabled,
  onToggleSound
}) => {
  const [activeCategory, setActiveCategory] = useState<DhikrCategory>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFadl, setExpandedFadl] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageModalItem, setImageModalItem] = useState<CardExportData | null>(null);

  const currentCategoryAdhkar = useMemo(() => {
    return adhkar.filter(item => item.category === activeCategory);
  }, [adhkar, activeCategory]);

  const filteredAdhkar = useMemo(() => {
    if (!searchQuery.trim()) return currentCategoryAdhkar;
    const query = searchQuery.toLowerCase();
    return currentCategoryAdhkar.filter(
      item => item.text.toLowerCase().includes(query) || (item.fadl && item.fadl.toLowerCase().includes(query))
    );
  }, [currentCategoryAdhkar, searchQuery]);

  const totalInCategory = currentCategoryAdhkar.length;
  const completedInCategory = currentCategoryAdhkar.filter(i => (i.currentCount >= i.count)).length;
  const categoryPercentage = totalInCategory > 0 ? Math.round((completedInCategory / totalInCategory) * 100) : 0;

  const handleTap = (item: DhikrItem) => {
    if (item.currentCount >= item.count) return;

    const nextCount = item.currentCount + 1;
    onUpdateCount(item.id, nextCount);

    if (soundEnabled) {
      if (nextCount === item.count) {
        playCompletionChime();
      } else {
        playBeadSound();
      }
    }
    triggerHaptic(nextCount === item.count ? 45 : 20);

    if (completedInCategory + 1 === totalInCategory && nextCount === item.count) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  const toggleFadl = (id: string) => {
    setExpandedFadl(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyDhikr = (item: DhikrItem) => {
    let textToCopy = `« ${item.text.trim()} »`;
    if (item.fadl) textToCopy += `\n\n✨ الفضل: ${item.fadl}`;
    if (item.reference) textToCopy += `\n📖 المصدر: ${item.reference}`;
    textToCopy += '\n\n🌸 تطبيق أذكار المسلم';

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(item.id);
        triggerHaptic(20);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-lg leading-relaxed';
      case 'large': return 'text-2xl leading-loose';
      default: return 'text-xl leading-relaxed';
    }
  };

  const activeCategoryInfo = categories.find(c => c.id === activeCategory);

  return (
    <div className="pb-24 pt-3 max-w-2xl mx-auto px-4">
      <AdhkarCategoryPills
        categories={categories}
        activeCategory={activeCategory}
        adhkar={adhkar}
        onSelect={setActiveCategory}
      />

      <CategoryOverviewCard
        categoryLabel={activeCategoryInfo?.label || ''}
        completedCount={completedInCategory}
        totalCount={totalInCategory}
        percentage={categoryPercentage}
        widgetTitle={`${activeCategoryInfo?.label || 'أذكار'} — ودجد`}
        widgetItems={currentCategoryAdhkar.slice(0, 6).map(a => ({ id: a.id, text: a.text, target: a.count }))}
        onShare={() => onOpenShare(currentCategoryAdhkar[0] || adhkar[0])}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onReset={() => onResetCategory(activeCategory)}
      />

      <div className="mt-3 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في نصوص الأذكار وفضائلها..."
          className="w-full px-10 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1"
          >
            مسح
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3.5">
        {filteredAdhkar.map((item, idx) => (
          <React.Fragment key={item.id}>
            <DhikrCard
              item={item}
              index={idx}
              isFadlOpen={Boolean(expandedFadl[item.id])}
              copied={copiedId === item.id}
              fontClass={getFontSizeClass()}
              onTap={() => handleTap(item)}
              onResetCount={() => onUpdateCount(item.id, 0)}
              onToggleFadl={() => toggleFadl(item.id)}
              onCopy={() => handleCopyDhikr(item)}
              onShare={() => onOpenShare(item)}
              onImage={() => {
                setImageModalItem({
                  title: activeCategoryInfo?.label || 'أذكار المسلم',
                  categoryLabel: activeCategoryInfo?.label,
                  text: item.text,
                  fadlOrBenefit: item.fadl,
                  reference: item.reference,
                  type: 'dhikr'
                });
              }}
            />
            {idx === 4 && <AdsFeedSlot template="medium" />}
          </React.Fragment>
        ))}

        {filteredAdhkar.length === 0 && (
          <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
            لا توجد أذكار تطابق البحث في هذه الفئة
          </div>
        )}
      </div>

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