import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, BookOpen, Search, Menu, Scale, AlertCircle, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchLawTOC, fetchLawContent, TOCItem } from '../services/geminiService';
import { cn } from '../lib/utils';
import { playClickSound } from '../lib/sound';

interface LawReaderProps {
  documentTitle: string;
  onClose: () => void;
}

const LawReader: React.FC<LawReaderProps> = ({ documentTitle, onClose }) => {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<TOCItem | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoadingTOC, setIsLoadingTOC] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load Table of Contents on mount
  useEffect(() => {
    const loadTOC = async () => {
      setIsLoadingTOC(true);
      const items = await fetchLawTOC(documentTitle);
      setToc(items);
      setIsLoadingTOC(false);
      
      // Select first item by default if available
      if (items.length > 0) {
        handleSectionSelect(items[0], true);
      }
    };
    loadTOC();
  }, [documentTitle]);

  const handleSectionSelect = async (section: TOCItem, silent = false) => {
    if (!silent) playClickSound();
    setSelectedSection(section);
    setContent("");
    setIsLoadingContent(true);
    
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    try {
      await fetchLawContent(documentTitle, section.title, (chunk) => {
        setContent(prev => prev + chunk);
      });
    } catch (error) {
      setContent("**Ошибка загрузки содержимого.** Пожалуйста, попробуйте другой раздел.");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  }

  const handleToggleSidebar = () => {
    playClickSound();
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            title="Назад"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col overflow-hidden">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Scale size={12} />
                <span>База Законодательства (Lex.uz)</span>
             </div>
             <h2 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white truncate">
                {documentTitle}
             </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Explicit Home Button in Header */}
           <button 
             onClick={handleClose}
             className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors text-sm font-medium"
           >
             <Home size={16} />
             <span>Главное меню</span>
           </button>

           <button 
             onClick={handleToggleSidebar}
             className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
           >
             <Menu size={24} />
           </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar (TOC) */}
        <aside className={cn(
            "absolute md:relative z-20 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-80 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden"
        )}>
           <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Оглавление</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {isLoadingTOC ? (
                 <div className="space-y-3 p-4">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ))}
                 </div>
              ) : (
                 <div className="space-y-1">
                    {toc.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSectionSelect(item)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg text-sm transition-colors flex items-start gap-3",
                                selectedSection?.id === item.id 
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" 
                                    : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                        >
                            <span className="opacity-50 font-mono text-xs mt-0.5">{item.id}.</span>
                            <span>{item.title}</span>
                        </button>
                    ))}
                 </div>
              )}
           </div>

           {/* Mobile Footer Button - Back to Main Menu */}
           <div className="md:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
             <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl transition-all duration-200 font-medium group"
             >
                <Home size={18} className="group-hover:scale-110 transition-transform" />
                <span>В главное меню</span>
             </button>
           </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
            <div 
                className="absolute inset-0 bg-black/50 z-10 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 no-scrollbar relative">
           
           <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-full">
               {!selectedSection ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center mt-20">
                       <BookOpen size={48} className="mb-4 opacity-20" />
                       <p>Выберите раздел из оглавления для чтения</p>
                   </div>
               ) : (
                   <div className="animate-in fade-in duration-500">
                        <div className="mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Раздел</span>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                {selectedSection.title}
                            </h1>
                        </div>
                        
                        {isLoadingContent && !content ? (
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-[90%] animate-pulse" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-[95%] animate-pulse" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-[80%] animate-pulse" />
                            </div>
                        ) : (
                            <div className="markdown-body text-slate-800 dark:text-slate-200 leading-relaxed text-base md:text-lg">
                                <ReactMarkdown>
                                    {content}
                                </ReactMarkdown>
                                {isLoadingContent && (
                                     <span className="inline-block w-2 h-4 ml-1 align-middle bg-blue-500 animate-pulse" />
                                )}
                            </div>
                        )}
                   </div>
               )}
           </div>
        </main>

      </div>
    </div>
  );
};

export default LawReader;