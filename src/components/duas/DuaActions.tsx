import React from 'react';
import { Copy, Check, Share2, Volume2, VolumeX, Heart, Image as ImageIcon } from 'lucide-react';

interface DuaActionsProps {
  isFavorite: boolean;
  isCopied: boolean;
  isSpeaking: boolean;
  hideSpeak?: boolean;
  onSpeak: () => void;
  onImage: () => void;
  onShare: () => void;
  onCopy: () => void;
  onToggleFavorite: () => void;
}

export const DuaActions: React.FC<DuaActionsProps> = ({
  isFavorite,
  isCopied,
  isSpeaking,
  hideSpeak,
  onSpeak,
  onImage,
  onShare,
  onCopy,
  onToggleFavorite
}) => (
  <div className="flex items-center gap-1">
    {!hideSpeak && (
      <button
        onClick={onSpeak}
        className={`p-1.5 rounded-xl transition-colors ${
          isSpeaking
            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
            : 'text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800'
        }`}
        title={isSpeaking ? 'إيقاف الاستماع' : 'استمع (سمع النص بالصوت)'}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    )}

    <button
      onClick={onImage}
      className="p-1.5 rounded-xl text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      title="تصدير كبطاقة صورة جميلة"
    >
      <ImageIcon className="w-4 h-4" />
    </button>

    <button
      onClick={onShare}
      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      title="مشاركة"
    >
      <Share2 className="w-4 h-4" />
    </button>

    <button
      onClick={onCopy}
      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      title="نسخ النص"
    >
      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>

    <button
      onClick={onToggleFavorite}
      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
    </button>
  </div>
);