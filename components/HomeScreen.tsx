import React from 'react';
import { MessageCircle, Book, Scale, ScrollText, FileBadge, ArrowRight } from 'lucide-react';
import { LegalCategory } from './LegalReferenceModal';
import { cn } from '../lib/utils';
import { GlowingEffect } from './ui/glowing-effect';
import { playClickSound } from '../lib/sound';

interface HomeScreenProps {
  onStartChat: () => void;
  onOpenCategory: (category: LegalCategory) => void;
  isExiting?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartChat, onOpenCategory, isExiting = false }) => {
  return (
    <div className={cn(
        "flex flex-col items-center justify-center min-h-full w-full max-w-4xl mx-auto px-4 py-8 md:py-12",
        !isExiting && "animate-in fade-in slide-in-from-bottom-4 duration-500",
        isExiting && "animate-slide-up-out pointer-events-none"
    )}>
      
      {/* 1. Primary Action Section */}
      <div className="w-full max-w-2xl text-center mb-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            AI LEGAL
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Ваш интеллектуальный помощник в правовом поле Республики Узбекистан.
          </p>
        </div>

        <div className="relative group inline-flex w-full sm:w-auto justify-center">
            {/* Subtle Pulsing Glow Background */}
            <div 
                className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse"
                style={{ animationDuration: '3s' }}
            />
            
            <button
                onClick={() => {
                  playClickSound();
                  onStartChat();
                }}
                className="relative flex items-center justify-center gap-3 w-full sm:w-auto min-w-[280px] px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1"
            >
                <MessageCircle className="w-6 h-6" />
                <span>Пообщаться с ИИ Юристом</span>
                <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                
                {/* Pulse effect ring (inner) */}
                <span className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </button>
        </div>
        
        <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">
          Нажмите, чтобы начать новую консультацию
        </p>
      </div>

      {/* 2. Secondary Content: Legal Reference Blocks */}
      <div className="w-full">
        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Законодательная База РУз
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Codes */}
          <li className="list-none group relative h-full">
            <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
                <GlowingEffect 
                    spread={40} 
                    glow={true} 
                    disabled={false} 
                    proximity={64} 
                    inactiveZone={0.01} 
                />
                <button
                    onClick={() => {
                      playClickSound();
                      onOpenCategory('codes');
                    }}
                    className="relative z-10 flex flex-col items-center h-full w-full p-6 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 text-center overflow-hidden"
                >
                    <div className="w-12 h-12 mb-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Кодексы
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Гражданский, Уголовный, Налоговый и другие кодексы РУз.
                    </p>
                </button>
            </div>
          </li>

          {/* Card 2: Constitution */}
          <li className="list-none group relative h-full">
            <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
                <GlowingEffect 
                    spread={40} 
                    glow={true} 
                    disabled={false} 
                    proximity={64} 
                    inactiveZone={0.01} 
                />
                <button
                    onClick={() => {
                      playClickSound();
                      onOpenCategory('constitution');
                    }}
                    className="relative z-10 flex flex-col items-center h-full w-full p-6 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 text-center overflow-hidden"
                >
                    <div className="w-12 h-12 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Конституция
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Основной закон Республики Узбекистан (новая редакция).
                    </p>
                </button>
            </div>
          </li>

          {/* Card 3: Laws */}
          <li className="list-none group relative h-full">
            <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
                <GlowingEffect 
                    spread={40} 
                    glow={true} 
                    disabled={false} 
                    proximity={64} 
                    inactiveZone={0.01} 
                />
                <button
                    onClick={() => {
                      playClickSound();
                      onOpenCategory('laws');
                    }}
                    className="relative z-10 flex flex-col items-center h-full w-full p-6 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 text-center overflow-hidden"
                >
                    <div className="w-12 h-12 mb-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ScrollText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Законы
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Федеральные законы и нормативно-правовые акты.
                    </p>
                </button>
            </div>
          </li>

          {/* Card 4: Decrees */}
          <li className="list-none group relative h-full">
            <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
                <GlowingEffect 
                    spread={40} 
                    glow={true} 
                    disabled={false} 
                    proximity={64} 
                    inactiveZone={0.01} 
                />
                <button
                    onClick={() => {
                      playClickSound();
                      onOpenCategory('decrees');
                    }}
                    className="relative z-10 flex flex-col items-center h-full w-full p-6 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 text-center overflow-hidden"
                >
                    <div className="w-12 h-12 mb-4 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FileBadge className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Указы
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Указы и постановления Президента и Кабинета Министров.
                    </p>
                </button>
            </div>
          </li>

        </ul>
      </div>
    </div>
  );
};

export default HomeScreen;