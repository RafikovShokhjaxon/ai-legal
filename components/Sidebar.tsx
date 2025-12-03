
import React, { useEffect, useState } from 'react';
import { Chat } from '../types';
import { MessageSquare, Trash2, Pin, Plus, X, Scale, Home, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ui/theme-toggle';
import { playClickSound } from '../lib/sound';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onTogglePin: (id: string) => void;
  onGoHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onGoHome
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const pinnedChats = chats.filter(chat => chat.isPinned).sort((a, b) => b.lastModified - a.lastModified);
  const otherChats = chats.filter(chat => !chat.isPinned).sort((a, b) => b.lastModified - a.lastModified);

  const renderChatItem = (chat: Chat) => {
    const isActive = currentChatId === chat.id;
    return (
        <div 
          key={chat.id}
          onClick={() => { 
            playClickSound();
            onSelectChat(chat.id); 
            if (window.innerWidth < 768) onClose(); 
          }}
          className={`
            group relative flex items-center gap-3 p-3 mx-3 mb-2 rounded-xl cursor-pointer
            transition-all duration-200 ease-out border
            ${isActive 
                ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-slate-900/40 dark:border-blue-500/50 scale-[1.02] translate-x-1' 
                : 'bg-slate-100 border-transparent hover:bg-slate-200 dark:bg-slate-800/20 dark:hover:bg-slate-800/60 dark:hover:border-slate-700 hover:scale-[1.01]'
            }
          `}
        >
          {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          )}

          <div className={`
            relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${isActive 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'bg-white border border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-transparent dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400'
            }
          `}>
             <MessageSquare size={18} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
             {chat.isPinned && (
                <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 z-10">
                    <Pin size={10} className="text-blue-500 fill-current" />
                </div>
             )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className={`text-sm font-semibold truncate transition-colors duration-200 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
              {chat.title}
            </h3>
            <p className={`text-[10px] truncate transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-200' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
              {new Date(chat.lastModified).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className={`
             flex items-center
             transition-all duration-200 ease-in-out
             ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}
          `}>
             {!isActive && (
                 <button 
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    playClickSound();
                    onTogglePin(chat.id); 
                  }}
                  className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mr-1 ${chat.isPinned ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`}
                  title={chat.isPinned ? "Открепить" : "Закрепить"}
                >
                  <Pin size={14} className={chat.isPinned ? "fill-current" : ""} />
                </button>
             )}
             
             <button 
                onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    playClickSound();
                    onDeleteChat(chat.id); 
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Удалить"
             >
                <Trash2 size={14} />
             </button>
          </div>
        </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col border-r border-slate-200 dark:border-slate-800
          transition-[transform,width] duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative
          ${isOpen ? 'md:w-80' : 'md:w-0 md:border-none'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full w-80 shrink-0">
            <div className="p-5 flex items-center justify-between shrink-0 h-20">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => { 
                  playClickSound();
                  onGoHome(); 
                  if (window.innerWidth < 768) onClose(); 
                }}
                title="На главную"
              >
                <div className="relative">
                    <Scale className="w-8 h-8 text-blue-600 dark:text-blue-500 transition-transform group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap tracking-tight">
                    AI LEGAL
                </h1>
              </div>
              <button 
                onClick={() => {
                  playClickSound();
                  onClose();
                }} 
                className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-4 pb-4 shrink-0 space-y-2">
              <button 
                onClick={() => { 
                  playClickSound();
                  onGoHome(); 
                  if (window.innerWidth < 768) onClose(); 
                }}
                className="group w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium"
              >
                <div className="w-6 flex justify-center text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400 transition-colors">
                    <Home size={20} />
                </div>
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Главное меню</span>
              </button>

              <button 
                onClick={() => { 
                  playClickSound();
                  onNewChat(); 
                  if (window.innerWidth < 768) onClose(); 
                }}
                className="group relative w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-xl transition-all duration-200 font-medium shadow-md shadow-blue-600/20 dark:shadow-blue-900/20 overflow-hidden active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Новая консультация</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-700">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-600 px-6 text-center animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
                    <MessageSquare size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium">История чатов пуста</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Начните новую консультацию, чтобы сохранить диалог</p>
                </div>
              ) : (
                <>
                  {pinnedChats.length > 0 && (
                    <div className="mb-6 animate-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center gap-2 px-6 py-2 mb-1">
                            <Pin size={10} className="text-blue-500" />
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Закрепленные</h3>
                        </div>
                        {pinnedChats.map(renderChatItem)}
                    </div>
                  )}
                  
                  {otherChats.length > 0 && (
                    <div className="animate-in slide-in-from-left-4 duration-300 delay-75">
                        {pinnedChats.length > 0 && (
                            <div className="flex items-center gap-2 px-6 py-2 mb-1 mt-2">
                                <MessageSquare size={10} className="text-slate-500 dark:text-slate-600" />
                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">История</h3>
                            </div>
                        )}
                        {otherChats.map(renderChatItem)}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900 shrink-0 flex flex-col gap-3">
                {mounted && (
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Тема оформления
                    </span>
                    <ThemeToggle />
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                   <span>&copy; 2024 AI LEGAL</span>
                   <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-700" />
                   <span>Законодательство РУз</span>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
