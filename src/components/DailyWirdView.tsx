import React, { useState } from 'react';
import { Plus, CalendarCheck, ScrollText } from 'lucide-react';
import { DailyWirdItem } from '../types';
import { playCompletionChime, triggerHaptic } from '../utils/audio';
import { ScholarAwradView } from './ScholarAwradView';
import { UniversalImageModal, CardExportData } from './UniversalImageModal';
import { AddWidgetButton } from './AddWidgetButton';
import { buildAwradSpec } from '../utils/widgets';
import confetti from 'canvas-confetti';
import { WirdBanner } from './wird/WirdBanner';
import { AddCustomWirdForm } from './wird/AddCustomWirdForm';
import { WirdItemRow } from './wird/WirdItemRow';

interface DailyWirdViewProps {
  wirdList: DailyWirdItem[];
  onToggleWirdItem: (id: string) => void;
  onUpdateWirdProgress: (id: string, delta: number) => void;
  onAddCustomWird: (item: DailyWirdItem) => void;
  onDeleteWird: (id: string) => void;
  fontSize?: 'small' | 'medium' | 'large';
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenShare?: (item: {
    id: string;
    type: 'wird';
    title: string;
    text: string;
    fadlOrBenefit?: string;
    reference?: string;
    categoryLabel?: string;
  }) => void;
}

export const DailyWirdView: React.FC<DailyWirdViewProps> = ({
  wirdList,
  onToggleWirdItem,
  onUpdateWirdProgress,
  onAddCustomWird,
  onDeleteWird,
  fontSize = 'medium',
  soundEnabled = true,
  onToggleSound,
  onOpenShare = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scholars' | 'schedule'>('scholars');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [imageModalItem, setImageModalItem] = useState<CardExportData | null>(null);

  const totalItems = wirdList.length;
  const completedCount = wirdList.filter(item => item.completed || item.current >= item.target).length;
  const completionPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleToggle = (item: DailyWirdItem) => {
    onToggleWirdItem(item.id);
    triggerHaptic(item.completed ? 20 : 40);

    if (!item.completed && completedCount + 1 === totalItems) {
      playCompletionChime();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  const handleAddScholarWirdToSchedule = (title: string, description: string, targetCount: number, unit: string) => {
    const newItem: DailyWirdItem = {
      id: 'custom-wird-' + Date.now(),
      title: title,
      description: description,
      target: targetCount || 1,
      current: 0,
      unit: unit || 'مرة',
      completed: false,
      category: 'sunnah'
    };
    onAddCustomWird(newItem);
  };

  return (
    <div className="pb-24 pt-3 max-w-2xl mx-auto px-4">
      <div className="flex p-1 bg-stone-200/80 dark:bg-stone-850 rounded-2xl mb-4">
        <button
          onClick={() => {
            setActiveSubTab('scholars');
            triggerHaptic(15);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
            activeSubTab === 'scholars'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <ScrollText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>أوراد المشايخ والعلماء</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
            شاملة
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('schedule');
            triggerHaptic(15);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
            activeSubTab === 'schedule'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>جدول الطاعات اليومي</span>
          {Boolean(totalItems - completedCount > 0) && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
              {totalItems - completedCount} متبقٍ
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'scholars' ? (
        <ScholarAwradView
          fontSize={fontSize}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onOpenShare={onOpenShare}
          onAddWirdToDailySchedule={handleAddScholarWirdToSchedule}
        />
      ) : (
        <div>
          <WirdBanner
            totalItems={totalItems}
            completedCount={completedCount}
            completionPercent={completionPercent}
          />

          <div className="mt-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              قائمة الورد لليوم
            </h3>
            <div className="flex items-center gap-2">
              <AddWidgetButton
                label="ودجد"
                title="أضف ودجد الورد اليومي عائم فوق الشاشة"
                getSpec={() =>
                  buildAwradSpec(
                    'الورد اليومي',
                    wirdList.slice(0, 6).map(w => ({ id: w.id, text: w.title, target: w.target }))
                  )
                }
              />
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إضافة ورد جديد</span>
              </button>
            </div>
          </div>

          {isAddingNew && (
            <AddCustomWirdForm
              onCancel={() => setIsAddingNew(false)}
              onAdd={(item) => {
                onAddCustomWird(item);
                setIsAddingNew(false);
              }}
            />
          )}

          <div className="mt-3 space-y-2.5">
            {wirdList.map((item) => (
              <WirdItemRow
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item)}
                onUpdateProgress={(delta) => onUpdateWirdProgress(item.id, delta)}
                onDelete={() => onDeleteWird(item.id)}
                onImage={() =>
                  setImageModalItem({
                    title: item.title,
                    categoryLabel: 'جدول الورد اليومي',
                    text: item.title + (item.description ? `\n\n${item.description}` : ''),
                    fadlOrBenefit: `الهدف اليومي: ${item.target} ${item.unit}`,
                    type: 'wird'
                  })
                }
              />
            ))}
          </div>
        </div>
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