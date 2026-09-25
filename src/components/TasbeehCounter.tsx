import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Volume2, VolumeX, BookOpen, Plus, Gift } from 'lucide-react';
import { tasbeehPresets } from '../data/adhkarData';
import { TasbeehItem, TasbeehCategory } from '../types';
import { loadCustomTasbeeh, saveCustomTasbeeh } from '../utils/storage';
import { onRewardedReward, showRewardedAd, adsSupported } from '../utils/ads';
import { playBeadSound, playCompletionChime, triggerHaptic } from '../utils/audio';
import { AddWidgetButton } from './AddWidgetButton';
import { buildTasbeehSpec } from '../utils/widgets';
import confetti from 'canvas-confetti';
import { TasbeehCategoryChips, TasbeehCategoryTab } from './tasbeeh/TasbeehCategoryChips';
import { TasbeehStrip } from './tasbeeh/TasbeehStrip';
import { TasbeehDial } from './tasbeeh/TasbeehDial';
import { TasbeehStats } from './tasbeeh/TasbeehStats';
import { CatalogModal } from './tasbeeh/CatalogModal';
import { AddTasbeehModal } from './tasbeeh/AddTasbeehModal';

interface TasbeehCounterProps {
  totalTasbeehCount: number;
  todayTasbeehCount: number;
  onIncrementTasbeeh: (amount?: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TasbeehCounter: React.FC<TasbeehCounterProps> = ({
  totalTasbeehCount,
  todayTasbeehCount,
  onIncrementTasbeeh,
  soundEnabled,
  onToggleSound
}) => {
  // Load custom tasbeehs from localStorage
  const [customTasbeehs, setCustomTasbeehs] = useState<TasbeehItem[]>(() => loadCustomTasbeeh());

  // Active category filter
  const [activeCategory, setActiveCategory] = useState<TasbeehCategory>('all');

  // Currently selected tasbeeh item
  const [selectedItem, setSelectedItem] = useState<TasbeehItem>(tasbeehPresets[0]);

  // Target and counts
  const [targetCount, setTargetCount] = useState<number | 'infinity'>(tasbeehPresets[0].count);
  const [currentCount, setCurrentCount] = useState(0);
  const [lapsCount, setLapsCount] = useState(0);
  const [isTapping, setIsTapping] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const [rewardUnavailable, setRewardUnavailable] = useState(false);

  // Rewarded Ad → +100 bonus tasbeeh
  useEffect(() => {
    if (!adsSupported()) return;
    const unsub = onRewardedReward(() => {
      onIncrementTasbeeh(100);
      setRewardEarned(true);
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.35 } });
      setTimeout(() => setRewardEarned(false), 3500);
    });
    return unsub;
  }, [onIncrementTasbeeh]);

  const handleWatchRewarded = async () => {
    if (rewardLoading || !adsSupported()) return;
    setRewardLoading(true);
    try {
      const ok = await showRewardedAd();
      if (!ok) {
        setRewardUnavailable(true);
        setTimeout(() => setRewardUnavailable(false), 3000);
      }
    } finally {
      setTimeout(() => setRewardLoading(false), 800);
    }
  };

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<TasbeehCategory>('all');

  // Combine built-in presets and custom tasbeehs
  const allTasbeehs = useMemo(() => {
    return [...customTasbeehs, ...tasbeehPresets];
  }, [customTasbeehs]);

  // Categories definitions
  const categoriesList: TasbeehCategoryTab[] = [
    { id: 'all', label: 'الكل' },
    { id: 'tasbeeh', label: 'تسبيح وتحميد' },
    { id: 'istighfar', label: 'استغفار' },
    { id: 'salawat', label: 'صلاة على النبي' },
    { id: 'tahlil', label: 'تهليل وحوقلة' },
    { id: 'dua', label: 'أدعية وتفريج' },
    { id: 'custom', label: `خاصتي (${customTasbeehs.length})` }
  ];

  // Filtered tasbeehs for top bar
  const displayedTasbeehs = useMemo(() => {
    if (activeCategory === 'all') return allTasbeehs;
    if (activeCategory === 'custom') return customTasbeehs;
    return allTasbeehs.filter(t => t.category === activeCategory);
  }, [allTasbeehs, customTasbeehs, activeCategory]);

  // Filtered tasbeehs for catalog modal
  const catalogTasbeehs = useMemo(() => {
    let list = allTasbeehs;
    if (catalogCategory === 'custom') {
      list = customTasbeehs;
    } else if (catalogCategory !== 'all') {
      list = list.filter(t => t.category === catalogCategory);
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.fadl && t.fadl.toLowerCase().includes(q)) ||
        (t.reference && t.reference.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allTasbeehs, customTasbeehs, catalogCategory, catalogSearch]);

  // Select a tasbeeh item
  const handleSelectTasbeeh = (item: TasbeehItem) => {
    setSelectedItem(item);
    setTargetCount(item.count);
    setCurrentCount(0);
    setLapsCount(0);
    triggerHaptic(20);
  };

  // Tap handler on the circular dial
  const handleTap = () => {
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 120);

    const next = currentCount + 1;
    onIncrementTasbeeh(1);

    if (targetCount !== 'infinity' && next >= targetCount) {
      setCurrentCount(0);
      setLapsCount(prev => prev + 1);

      if (soundEnabled) playCompletionChime();
      triggerHaptic(50);

      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      setCurrentCount(next);
      if (soundEnabled) playBeadSound();
      triggerHaptic(20);
    }
  };

  const handleReset = () => {
    setCurrentCount(0);
    setLapsCount(0);
    triggerHaptic(30);
  };

  // Add custom tasbeeh submit
  const handleCreateCustomTasbeeh = (newItem: TasbeehItem) => {
    const updated = [newItem, ...customTasbeehs];
    setCustomTasbeehs(updated);
    saveCustomTasbeeh(updated);

    // Select the new item immediately
    handleSelectTasbeeh(newItem);
    setIsAddModalOpen(false);
  };

  // Delete a custom tasbeeh
  const handleDeleteCustomTasbeeh = (id: string) => {
    const updated = customTasbeehs.filter(t => t.id !== id);
    setCustomTasbeehs(updated);
    saveCustomTasbeeh(updated);

    // If deleting the active item, fall back to default
    if (selectedItem.id === id) {
      handleSelectTasbeeh(tasbeehPresets[0]);
    }
    triggerHaptic(30);
  };

  // Quick preset targets
  const standardTargets: (number | 'infinity')[] = [33, 100, 1000, 'infinity'];

  return (
    <div className="pb-24 pt-2.5 max-w-2xl mx-auto px-4" dir="rtl">
      {/* Unified Top Controls: Category Tabs & Quick Action Tools */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Category Filter Tabs */}
        <div className="flex-1 min-w-0">
          <TasbeehCategoryChips
            categories={categoriesList}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Action Header: Browse Catalog & Add Custom */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsCatalogOpen(true)}
            id="btn-open-tasbeeh-catalog"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
            title="تصفح جميع التسابيح المأثورة"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">الفهرس</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded-md font-semibold">
              {allTasbeehs.length}
            </span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-custom-tasbeeh"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-colors"
            title="إضافة تسبيح مخصص"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إضافة</span>
          </button>

          <AddWidgetButton
            label="ودجد"
            title="أضف ودجد هذه المسبحة عائم فوق الشاشة"
            getSpec={() =>
              buildTasbeehSpec(
                selectedItem.title,
                typeof targetCount === 'number' && targetCount > 0 ? targetCount : 100
              )
            }
          />
        </div>
      </div>

      {/* Horizontal List of Tasbeehs in active category */}
      <TasbeehStrip
        items={displayedTasbeehs}
        selectedId={selectedItem.id}
        onSelect={handleSelectTasbeeh}
        onDelete={handleDeleteCustomTasbeeh}
      />

      {/* Target Count & Options Controls Bar */}
      <div className="mt-3 flex items-center justify-between bg-stone-100 dark:bg-stone-850 p-2.5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
        {/* Target Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold px-1 whitespace-nowrap">
            الهدف:
          </span>
          {standardTargets.map((tgt) => (
            <button
              key={String(tgt)}
              onClick={() => {
                setTargetCount(tgt);
                setCurrentCount(0);
                triggerHaptic(20);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                targetCount === tgt
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {tgt === 'infinity' ? 'مفتوح ∞' : tgt}
            </button>
          ))}
        </div>

        {/* Audio Toggle & Reset */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleSound}
            id="btn-toggle-sound-tasbeeh"
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-800 transition-colors"
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleWatchRewarded}
            id="btn-rewarded-ad"
            className={`p-2 rounded-xl transition-colors ${
              rewardEarned
                ? 'text-white bg-amber-500 animate-pulse'
                : 'text-amber-500 hover:bg-white dark:hover:bg-stone-800'
            }`}
            title="شاهد إعلاناً قصيراً واحصل على +100 تسبيحة"
          >
            <Gift className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            id="btn-reset-tasbeeh"
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-rose-500 hover:bg-white dark:hover:bg-stone-800 transition-colors"
            title="تصفير المسبحة والدورات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {rewardEarned && (
        <div className="mt-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold text-center animate-fade-in">
          مبارك! ربحت +100 تسبيحة 🎉
        </div>
      )}

      {rewardUnavailable && (
        <div className="mt-3 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold text-center animate-fade-in">
          لا يوجد إعلان متاح الآن — جرّب بعد قليل
        </div>
      )}

      {/* Main Interactive Tasbeeh Circular Dial Area */}
      <TasbeehDial
        item={selectedItem}
        currentCount={currentCount}
        targetCount={targetCount}
        lapsCount={lapsCount}
        isTapping={isTapping}
        onTap={handleTap}
      />

      {/* Total Statistics Cards */}
      <TasbeehStats todayCount={todayTasbeehCount} totalCount={totalTasbeehCount} />

      {/* Catalog Modal */}
      <CatalogModal
        open={isCatalogOpen}
        allCount={allTasbeehs.length}
        items={catalogTasbeehs}
        categories={categoriesList}
        activeCategory={catalogCategory}
        onCategoryChange={setCatalogCategory}
        search={catalogSearch}
        onSearchChange={setCatalogSearch}
        selectedId={selectedItem.id}
        onSelect={(t) => {
          handleSelectTasbeeh(t);
          setIsCatalogOpen(false);
        }}
        onAddNew={() => {
          setIsCatalogOpen(false);
          setIsAddModalOpen(true);
        }}
        onClose={() => setIsCatalogOpen(false)}
      />

      {/* Add Custom Tasbeeh Modal */}
      <AddTasbeehModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateCustomTasbeeh}
      />
    </div>
  );
};