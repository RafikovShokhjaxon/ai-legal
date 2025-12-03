import React from 'react';
import { X, ExternalLink, Book, Scale, ScrollText, FileBadge, Eye } from 'lucide-react';
import { playClickSound } from '../lib/sound';

export type LegalCategory = 'constitution' | 'codes' | 'laws' | 'decrees' | null;

interface LegalReferenceModalProps {
  category: LegalCategory;
  onClose: () => void;
  onDocumentOpen: (docTitle: string) => void;
}

const UZ_LEGAL_DATA = {
  constitution: {
    title: 'Конституция Республики Узбекистан',
    icon: <Book className="w-6 h-6 text-blue-600" />,
    description: 'Основной закон государства, обладающий высшей юридической силой.',
    items: [
      { name: 'Конституция РУз (Новая редакция)', link: 'https://lex.uz/docs/6445145' },
      { name: 'Раздел I. Основные принципы', link: '#' },
      { name: 'Раздел II. Основные права, свободы и обязанности', link: '#' },
      { name: 'Раздел III. Общество и личность', link: '#' },
      { name: 'Раздел IV. Административно-территориальное устройство', link: '#' },
    ]
  },
  codes: {
    title: 'Кодексы Республики Узбекистан',
    icon: <Scale className="w-6 h-6 text-indigo-600" />,
    description: 'Свод систематизированных законодательных актов.',
    items: [
      { name: 'Гражданский кодекс Республики Узбекистан', link: 'https://lex.uz/docs/111189' },
      { name: 'Уголовный кодекс Республики Узбекистан', link: 'https://lex.uz/docs/111453' },
      { name: 'Кодекс РУз об административной ответственности', link: 'https://lex.uz/docs/97664' },
      { name: 'Налоговый кодекс Республики Узбекистан', link: 'https://lex.uz/docs/4674902' },
      { name: 'Трудовой кодекс Республики Узбекистан', link: 'https://lex.uz/docs/6257299' },
      { name: 'Семейный кодекс Республики Узбекистан', link: 'https://lex.uz/docs/104720' },
      { name: 'Земельный кодекс Республики Узбекистан', link: 'https://lex.uz/docs/150392' },
    ]
  },
  laws: {
    title: 'Законы Республики Узбекистан',
    icon: <ScrollText className="w-6 h-6 text-emerald-600" />,
    description: 'Ключевые законы, регулирующие различные сферы деятельности.',
    items: [
      { name: 'Закон «О нормативно-правовых актах»', link: 'https://lex.uz/docs/5378966' },
      { name: 'Закон «Об обращениях физических и юридических лиц»', link: 'https://lex.uz/docs/3336169' },
      { name: 'Закон «О защите прав потребителей»', link: 'https://lex.uz/docs/29474' },
      { name: 'Закон «Об электронном правительстве»', link: 'https://lex.uz/docs/2833871' },
      { name: 'Закон «О гражданстве Республики Узбекистан»', link: 'https://lex.uz/docs/4761988' },
    ]
  },
  decrees: {
    title: 'Указы и Постановления',
    icon: <FileBadge className="w-6 h-6 text-purple-600" />,
    description: 'Важные акты Президента и Кабинета Министров.',
    items: [
      { name: 'Стратегия «Узбекистан — 2030»', link: 'https://lex.uz/docs/6600413' },
      { name: 'Указ «О мерах по цифровизации судебной власти»', link: 'https://lex.uz/docs/5030789' },
      { name: 'Постановление «О поддержке предпринимательства»', link: 'https://lex.uz/docs/6369062' },
    ]
  }
};

export const LegalReferenceModal: React.FC<LegalReferenceModalProps> = ({ category, onClose, onDocumentOpen }) => {
  if (!category) return null;

  const data = UZ_LEGAL_DATA[category];

  const handleDocumentClick = (name: string) => {
    playClickSound();
    onClose(); // Close modal first
    onDocumentOpen(name); // Open reader
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {data.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {data.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {data.description}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-6 scrollbar-thin">
          <div className="grid gap-3">
            {data.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleDocumentClick(item.name)}
                className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left w-full"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 group-hover:text-blue-500 transition-colors uppercase font-bold tracking-wider">Читать</span>
                    <Eye size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Документы загружаются из базы знаний AI LEGAL, синхронизированной с Lex.uz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};