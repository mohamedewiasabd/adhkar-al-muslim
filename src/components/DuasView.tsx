import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { initialDuasData } from '../data/duasData';
import { asmaAlHusnaData } from '../data/asmaAlHusna';
import { ruqyaData } from '../data/ruqyaData';
import { DuaItem } from '../types';
import { triggerHaptic, isSpeechSupported, speakText, speakRepeated, stopSpeech } from '../utils/audio';
import { matchesArabic } from '../utils/search';
import { UniversalImageModal, CardExportData } from './UniversalImageModal';
import { AddWidgetButton } from './AddWidgetButton';
import { buildDuaSpec } from '../utils/widgets';
import { DuasSection } from './duas/DuasSection';
import { AsmaSection } from './duas/AsmaSection';
import { RuqyaSection } from './duas/RuqyaSection';
import { DuasModeTabs, SectionMode } from './duas/DuasModeTabs';

interface DuasViewProps {
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onOpenShare: (dua?: DuaItem) => void;
  fontSize: 'small' | 'medium' | 'large';
}

export const DuasView: React.FC<DuasViewProps> = ({
  favoriteIds,
  onToggleFavorite,
  onOpenShare,
  fontSize
}) => {
  const [mode, setMode] = useState<SectionMode>('duas');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageModalItem, setImageModalItem] = useState<CardExportData | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const switchMode = (next: SectionMode) => {
    setMode(next);
    setSelectedCategory('all');
    setShowOnlyFavorites(false);
    setSearchQuery('');
    setCopiedId(null);
    stopSpeech();
    setSpeakingId(null);
  };

  const handleSpeak = (id: string, text: string, times = 1) => {
    if (speakingId === id) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }
    if (!isSpeechSupported()) {
      alert('محرك النطق غير متوفر على هذا الجهاز. ثبّت محركاً صوتياً عربياً في إعدادات النظام.');
      return;
    }
    stopSpeech();
    const started = times > 1
      ? speakRepeated(text, times, () => setSpeakingId(null))
      : speakText(text, { onEnd: () => setSpeakingId(null) });
    if (started) {
      setSpeakingId(id);
      triggerHaptic(15);
    }
  };

  const filteredDuas = useMemo(() => {
    let result = initialDuasData;

    if (showOnlyFavorites) {
      result = result.filter(d => favoriteIds.includes(d.id));
    } else if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(d =>
        matchesArabic(searchQuery, d.title, d.arabic, d.benefit, d.reference)
      );
    }

    return result;
  }, [selectedCategory, searchQuery, showOnlyFavorites, favoriteIds]);

  const filteredAsma = useMemo(() => {
    let result = asmaAlHusnaData;
    if (showOnlyFavorites) {
      result = result.filter(a => favoriteIds.includes(a.id));
    }
    if (searchQuery.trim()) {
      result = result.filter(a =>
        matchesArabic(searchQuery, a.name, a.meaning, a.fadl, a.reference)
      );
    }
    return result;
  }, [searchQuery, showOnlyFavorites, favoriteIds]);

  const filteredRuqya = useMemo(() => {
    let result = ruqyaData;
    if (showOnlyFavorites) {
      result = result.filter(r => favoriteIds.includes(r.id));
    }
    if (searchQuery.trim()) {
      result = result.filter(r =>
        matchesArabic(searchQuery, r.title, r.arabic, r.reference, r.note)
      );
    }
    return result.sort((a, b) => a.order - b.order);
  }, [searchQuery, showOnlyFavorites, favoriteIds]);

  const copyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        triggerHaptic(20);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const copyPayload = (item: DuaItem) => {
    if (item.id.startsWith('asm-')) {
      const a = asmaAlHusnaData.find(x => x.id === item.id);
      if (a) return `🌙 ${a.number}. ${a.name}\n\n${a.meaning}\n✨ الفضل: ${a.fadl}\n📖 ${a.reference}\n\n🌸 تطبيق أذكار المسلم`;
    } else if (item.id.startsWith('rq-')) {
      const r = ruqyaData.find(x => x.id === item.id);
      if (r) return `📿 ${r.title}\n\n« ${r.arabic} »\n🔁 تُكرر: ${r.repetition}\n📖 ${r.reference}\n\n🌸 تطبيق أذكار المسلم`;
    }
    let text = `🤲 ${item.title}\n\n« ${item.arabic} »`;
    if (item.benefit) text += `\n\n✨ الفضل: ${item.benefit}`;
    if (item.reference) text += `\n📖 المصدر: ${item.reference}`;
    return text + '\n\n🌸 تطبيق أذكار المسلم';
  };

  const handleCopyItem = (item: DuaItem) => copyText(item.id, copyPayload(item));

  const handleImageItem = (item: DuaItem) => {
    setImageModalItem({
      title: item.title,
      categoryLabel: item.category === 'ruqyah' ? 'الرقية الشرعية' : item.category === 'quranic' ? 'اسم من أسماء الله' : 'دعاء مأثور',
      text: item.arabic,
      fadlOrBenefit: item.benefit,
      reference: item.reference,
      type: 'dua'
    });
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-lg leading-relaxed';
      case 'large': return 'text-2xl leading-loose';
      default: return 'text-xl leading-relaxed';
    }
  };

  const searchBar = (
    <div className="relative flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={
          mode === 'duas'
            ? 'ابحث في الأدعية المأثورة...'
            : mode === 'asma'
              ? 'ابحث عن اسمٍ من أسماء الله الحسنى...'
              : 'ابحث في آيات وأدعية الرقية...'
        }
        className="w-full px-10 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
  );

  return (
    <div className="pb-24 pt-3 max-w-2xl mx-auto px-4">
      <DuasModeTabs mode={mode} onSwitch={switchMode} />

      <div className="mt-2 flex items-center gap-2">
        {searchBar}
        {mode === 'duas' && (
          <AddWidgetButton
            label="ودجد دعاء"
            title="أضف ودجد دعاء اليوم عائم فوق الشاشة"
            className="shrink-0"
            getSpec={() =>
              buildDuaSpec(
                'دعاء اليوم',
                initialDuasData.slice(0, 6).map(d => ({ id: d.id, text: d.arabic }))
              )
            }
          />
        )}
      </div>

      {mode === 'duas' && (
        <DuasSection
          items={filteredDuas}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setShowOnlyFavorites(false);
            setSelectedCategory(id);
          }}
          showOnlyFavorites={showOnlyFavorites}
          favoritesCount={favoriteIds.length}
          favoriteIds={favoriteIds}
          copiedId={copiedId}
          speakingId={speakingId}
          fontClass={getFontSizeClass()}
          onSpeak={handleSpeak}
          onCopyItem={handleCopyItem}
          onImage={handleImageItem}
          onShare={(item) => onOpenShare(item)}
          onToggleFavorite={onToggleFavorite}
          onToggleFavoritesOnly={() => setShowOnlyFavorites(v => !v)}
        />
      )}

      {mode === 'asma' && (
        <AsmaSection
          items={filteredAsma}
          showOnlyFavorites={showOnlyFavorites}
          favoritesCount={favoriteIds.length}
          favoriteIds={favoriteIds}
          copiedId={copiedId}
          speakingId={speakingId}
          onSpeak={handleSpeak}
          onCopyItem={handleCopyItem}
          onImage={handleImageItem}
          onShare={(item) => onOpenShare(item)}
          onToggleFavorite={onToggleFavorite}
          onToggleFavoritesOnly={() => setShowOnlyFavorites(v => !v)}
        />
      )}

      {mode === 'ruqya' && (
        <RuqyaSection
          items={filteredRuqya}
          showOnlyFavorites={showOnlyFavorites}
          favoritesCount={favoriteIds.length}
          favoriteIds={favoriteIds}
          copiedId={copiedId}
          speakingId={speakingId}
          fontClass={getFontSizeClass()}
          onSpeak={handleSpeak}
          onCopyItem={handleCopyItem}
          onImage={handleImageItem}
          onShare={(item) => onOpenShare(item)}
          onToggleFavorite={onToggleFavorite}
          onToggleFavoritesOnly={() => setShowOnlyFavorites(v => !v)}
        />
      )}

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