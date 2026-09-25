import React, { useState, useEffect, useMemo } from 'react';
import { X, Share2 } from 'lucide-react';
import { DhikrItem, DuaItem, ScholarWirdItem, SurahMeta, AyahItem } from '../types';
import { scholarAwradList } from '../data/awradData';
import { surahsList as defaultSurahs } from '../data/quranMeta';
import { bundledQuranSurahs as defaultQuran } from '../data/bundledQuran';
import { triggerHaptic } from '../utils/audio';
import { UniversalImageModal, CardExportData } from './UniversalImageModal';
import { ShareTabs, ShareTab } from './share/ShareTabs';
import { ItemPicker } from './share/ItemPicker';
import { QuranPicker } from './share/QuranPicker';
import { PreviewCard } from './share/PreviewCard';
import { CustomizationOptions } from './share/CustomizationOptions';
import { ShareChannels } from './share/ShareChannels';
import {
  copyShareText,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaTwitter,
  shareViaLine,
  shareViaViber,
  shareViaPinterest,
  shareViaEmail,
  shareViaSms,
  nativeShare
} from '../utils/shareActions';

export interface SelectedShareable {
  id: string;
  type: 'dhikr' | 'dua' | 'wird' | 'quran';
  title: string;
  text: string;
  fadlOrBenefit?: string;
  reference?: string;
  categoryLabel?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: SelectedShareable | null;
  adhkarList: DhikrItem[];
  duasList: DuaItem[];
  scholarAwrad?: ScholarWirdItem[];
  surahs?: SurahMeta[];
  quranBySurah?: Record<number, { bismillah?: boolean; ayahs: AyahItem[] }>;
}

export const getDhikrCategoryLabel = (category: string): string => {
  switch (category) {
    case 'morning': return 'أذكار الصباح';
    case 'evening': return 'أذكار المساء';
    case 'sleep': return 'أذكار النوم';
    case 'wake': return 'أذكار الاستيقاظ';
    case 'after_prayer': return 'أذكار بعد الصلاة';
    case 'masjid': return 'أذكار المسجد والأذان';
    case 'home': return 'أذكار المنزل والخلاء';
    case 'wudu': return 'أذكار الوضوء والطهارة';
    case 'food': return 'أذكار الطعام واللباس';
    case 'day_night': return 'أذكار اليوم والليلة';
    case 'stress': return 'أذكار الهم والحزن والكرب';
    case 'travel': return 'أذكار السفر والركوب';
    case 'weather': return 'أذكار المطر والرعد والريح';
    case 'tasbeeh': return 'تسبيح وتهليل';
    case 'qiyam': return 'مفاتيح قيام الليل';
    default: return 'أذكار يومية';
  }
};

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  initialItem,
  adhkarList,
  duasList,
  scholarAwrad = scholarAwradList,
  surahs = defaultSurahs,
  quranBySurah = defaultQuran
}) => {
  const [activeTab, setActiveTab] = useState<ShareTab>('dhikr');
  const [selectedId, setSelectedId] = useState<string>('');
  const [customItem, setCustomItem] = useState<SelectedShareable | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [includeBenefit, setIncludeBenefit] = useState<boolean>(true);
  const [includeReference, setIncludeReference] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isQuranSurahOpen, setIsQuranSurahOpen] = useState<boolean>(false);
  const [quranSurahNumber, setQuranSurahNumber] = useState<number>(1);
  const [quranAyahNumber, setQuranAyahNumber] = useState<number>(1);

  // Image Export Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Set initial item when opened
  useEffect(() => {
    if (initialItem) {
      setActiveTab(initialItem.type);
      setSelectedId(initialItem.id);
      setCustomItem(initialItem);
      if (initialItem.type === 'quran' && initialItem.id.startsWith('q-')) {
        const [, s, a] = initialItem.id.split('-');
        const surahNum = parseInt(s, 10);
        if (!isNaN(surahNum)) setQuranSurahNumber(surahNum);
        const ayahNum = parseInt(a, 10);
        if (!isNaN(ayahNum)) setQuranAyahNumber(ayahNum);
      }
    } else {
      setCustomItem(null);
      if (adhkarList.length > 0 && !selectedId) {
        setSelectedId(adhkarList[0].id);
      }
    }
  }, [initialItem, adhkarList, isOpen]);

  // When changing tab, default to first item of that tab if current selected is not in it
  const handleTabChange = (tab: ShareTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setCustomItem(null);
    setIsDropdownOpen(false);
    if (tab === 'dhikr') {
      const exists = adhkarList.some(a => a.id === selectedId);
      if (!exists && adhkarList.length > 0) {
        setSelectedId(adhkarList[0].id);
      }
    } else if (tab === 'dua') {
      const exists = duasList.some(d => d.id === selectedId);
      if (!exists && duasList.length > 0) {
        setSelectedId(duasList[0].id);
      }
    } else if (tab === 'wird') {
      const exists = scholarAwrad.some(w => w.id === selectedId);
      if (!exists && scholarAwrad.length > 0) {
        setSelectedId(scholarAwrad[0].id);
      }
    }
  };

  // ----- Quran tab helpers -----
  const currentSurah = surahs.find(s => s.number === quranSurahNumber) || surahs[0];
  const currentAyah =
    quranBySurah?.[quranSurahNumber]?.ayahs?.find(a => a.numberInSurah === quranAyahNumber) || null;

  // Resolve currently active item
  const currentItem: SelectedShareable | null = useMemo(() => {
    if (customItem && customItem.id === selectedId) {
      return customItem;
    }

    if (activeTab === 'dhikr') {
      const found = adhkarList.find(a => a.id === selectedId) || adhkarList[0];
      if (!found) return null;
      return {
        id: found.id,
        type: 'dhikr',
        title: getDhikrCategoryLabel(found.category),
        text: found.text,
        fadlOrBenefit: found.fadl,
        reference: found.reference,
        categoryLabel: getDhikrCategoryLabel(found.category)
      };
    } else if (activeTab === 'dua') {
      const found = duasList.find(d => d.id === selectedId) || duasList[0];
      if (!found) return null;
      return {
        id: found.id,
        type: 'dua',
        title: found.title,
        text: found.arabic,
        fadlOrBenefit: found.benefit,
        reference: found.reference,
        categoryLabel: 'دعاء مأثور'
      };
    } else if (activeTab === 'quran') {
      if (!currentSurah || !currentAyah) return null;
      return {
        id: `q-${currentSurah.number}-${currentAyah.numberInSurah}`,
        type: 'quran',
        title: `سورة ${currentSurah.name}`,
        text: currentAyah.text,
        reference: `الآية ${currentAyah.numberInSurah} • صفحة ${currentAyah.page} • جزء ${currentAyah.juz}`,
        categoryLabel: 'القرآن الكريم'
      };
    } else {
      const found = scholarAwrad.find(w => w.id === selectedId) || scholarAwrad[0];
      if (!found) return null;
      return {
        id: found.id,
        type: 'wird',
        title: found.title,
        text: found.fullText.length > 500 ? found.fullText.slice(0, 480) + '...' : found.fullText,
        fadlOrBenefit: found.shortDescription,
        reference: `${found.scholar} • ${found.sourceReference}`,
        categoryLabel: found.scholar
      };
    }
  }, [activeTab, selectedId, adhkarList, duasList, scholarAwrad, customItem, currentSurah, currentAyah]);

  // Filter items for selection list
  const selectableItems = useMemo(() => {
    if (activeTab === 'dhikr') {
      return adhkarList.filter(a => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return a.text.toLowerCase().includes(q) || (a.fadl && a.fadl.toLowerCase().includes(q));
      });
    } else if (activeTab === 'dua') {
      return duasList.filter(d => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return d.title.toLowerCase().includes(q) || d.arabic.toLowerCase().includes(q) || (d.benefit && d.benefit.toLowerCase().includes(q));
      });
    } else {
      return scholarAwrad.filter(w => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return w.title.toLowerCase().includes(q) || w.scholar.toLowerCase().includes(q) || w.shortDescription.toLowerCase().includes(q);
      });
    }
  }, [activeTab, adhkarList, duasList, scholarAwrad, searchQuery]);

  // Build the formatted text representation
  const formattedShareText = useMemo(() => {
    if (!currentItem) return '';

    const lines: string[] = [];

    if (currentItem.type === 'dhikr') {
      lines.push(`🌿 من ${currentItem.title} 🌿`);
    } else if (currentItem.type === 'dua') {
      lines.push(`🤲 دعاء: ${currentItem.title} 🤲`);
    } else if (currentItem.type === 'quran') {
      lines.push('「 آية كريمة من كتاب الله 」');
      lines.push(`📖 ${currentItem.title} • ${currentItem.reference}`);
    } else {
      lines.push(`📜 ${currentItem.title} (${currentItem.categoryLabel || 'ورد مأثور'}) 📜`);
    }
    lines.push('');

    lines.push(`« ${currentItem.text.trim()} »`);
    lines.push('');

    if (includeBenefit && currentItem.fadlOrBenefit && currentItem.type !== 'quran') {
      lines.push(`✨ الفضل: ${currentItem.fadlOrBenefit}`);
    }

    if (includeReference && currentItem.reference) {
      lines.push(`📖 المصدر: ${currentItem.reference}`);
    }

    if (includeSignature) {
      lines.push('');
      lines.push('🌸 فالدال على الخير كفاعله');
      lines.push('📱 تطبيق أذكار المسلم - الورد اليومي');
    }

    return lines.join('\n');
  }, [currentItem, includeBenefit, includeReference, includeSignature]);

  // Sharing Actions
  const handleCopy = () => {
    copyShareText(formattedShareText).then((ok) => {
      if (ok) {
        setCopied(true);
        triggerHaptic(25);
        setTimeout(() => setCopied(false), 2500);
      }
    });
  };

  const handleNativeShare = async () => {
    if (!currentItem) return;
    const didFallback = await nativeShare(currentItem.title, formattedShareText);
    if (didFallback) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTwitterShare = () => {
    if (!currentItem) return;
    shareViaTwitter(formattedShareText, `« ${currentItem.text.slice(0, 180)}... »\n\n#أذكار #دعاء #أذكار_المسلم`);
  };

  if (!isOpen || !currentItem) return null;

  // Convert currentItem to CardExportData
  const exportCardData: CardExportData = {
    title: currentItem.title,
    categoryLabel: currentItem.categoryLabel,
    text: currentItem.text,
    fadlOrBenefit: includeBenefit ? currentItem.fadlOrBenefit : undefined,
    reference: includeReference ? currentItem.reference : undefined,
    type: currentItem.type
  };

  const snippetText =
    currentItem.type === 'dhikr'
      ? currentItem.text.slice(0, 55) + '...'
      : currentItem.type === 'dua'
      ? currentItem.title
      : `${currentItem.title} (${currentItem.categoryLabel})`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
        <div
          id="share-modal-container"
          className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[92vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  مشاركة الأذكار والأدعية والأوراد
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  انشر الخير نصوصاً أو صدّرها كبطاقات مصورة فاخرة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              id="btn-close-share-modal"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 py-3.5 space-y-4 pr-1">
            <ShareTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              adhkarCount={adhkarList.length}
              duasCount={duasList.length}
              awradCount={scholarAwrad.length}
            />

            {activeTab !== 'quran' ? (
              <ItemPicker
                activeTab={activeTab}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(prev => !prev)}
                badgeText={currentItem.categoryLabel || currentItem.title}
                snippetText={snippetText}
                items={selectableItems}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setCustomItem(null);
                  setIsDropdownOpen(false);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            ) : (
              <QuranPicker
                surahs={surahs}
                currentSurah={currentSurah}
                quranSurahNumber={quranSurahNumber}
                quranAyahNumber={quranAyahNumber}
                isSurahOpen={isQuranSurahOpen}
                onSurahOpenChange={setIsQuranSurahOpen}
                onSelectSurah={(n) => {
                  setQuranSurahNumber(n);
                  setQuranAyahNumber(1);
                  setIsQuranSurahOpen(false);
                }}
                onAyahChange={setQuranAyahNumber}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            <PreviewCard
              item={currentItem}
              includeBenefit={includeBenefit}
              includeReference={includeReference}
              onExportImage={() => {
                triggerHaptic(20);
                setIsImageModalOpen(true);
              }}
            />

            <CustomizationOptions
              includeBenefit={includeBenefit}
              onBenefitChange={setIncludeBenefit}
              includeReference={includeReference}
              onReferenceChange={setIncludeReference}
              includeSignature={includeSignature}
              onSignatureChange={setIncludeSignature}
            />
          </div>

          {/* Action Share Channels Footer */}
          <ShareChannels
            copied={copied}
            onCopy={handleCopy}
            onWhatsApp={() => shareViaWhatsApp(formattedShareText)}
            onTelegram={() => shareViaTelegram(formattedShareText)}
            onTwitter={handleTwitterShare}
            onLine={() => shareViaLine(formattedShareText)}
            onViber={() => shareViaViber(formattedShareText)}
            onPinterest={() => shareViaPinterest(formattedShareText)}
            onEmail={() => shareViaEmail(currentItem.title, formattedShareText)}
            onSms={() => shareViaSms(formattedShareText)}
            onNative={handleNativeShare}
            onExportImage={() => {
              triggerHaptic(25);
              setIsImageModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Universal Image Export Sub-Modal */}
      {isImageModalOpen && (
        <UniversalImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          data={exportCardData}
        />
      )}
    </>
  );
};