import React, { useState } from 'react';
import { DailyWirdItem } from '../../types';

interface AddCustomWirdFormProps {
  onCancel: () => void;
  onAdd: (item: DailyWirdItem) => void;
}

export const AddCustomWirdForm: React.FC<AddCustomWirdFormProps> = ({ onCancel, onAdd }) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('مرة');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: DailyWirdItem = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      target: Number(target) || 1,
      current: 0,
      unit: unit.trim() || 'مرة',
      completed: false,
      category: 'adhkar'
    };

    onAdd(newItem);
    setTitle('');
    setTarget(1);
    setUnit('مرة');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-stone-100 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
        إضافة طاعة أو ورد مخصص
      </div>
      <div>
        <label className="block text-[11px] text-stone-500 mb-1">اسم الورد / الطاعة</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: صلاة الضحى، قيام الليل، قراءة صفحة تفسير..."
          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">العدد المستهدف</label>
          <input
            type="number"
            min="1"
            value={target}
            onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">الوحدة</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="مرات / صفحات / ركعات"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          حفظ الورد
        </button>
      </div>
    </form>
  );
};