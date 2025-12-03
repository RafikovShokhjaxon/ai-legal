
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import VoiceInterface from './components/VoiceInterface';
import { Chat, Message, Role, AppMode } from './types';
import { sendMessageStream, generateTitle } from './services/geminiService';
import { Menu, Scale, ChevronLeft } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from './constants';
import ChatInput from './components/ui/chat-input';
import AnimatedShaderBackground from './components/ui/animated-shader-background';
import HomeScreen from './components/HomeScreen';
import { LegalReferenceModal, LegalCategory } from './components/LegalReferenceModal';
import LawReader from './components/LawReader';
import { useTheme } from 'next-themes';
import { playClickSound } from './lib/sound';

const STORAGE_KEY = 'lexassist_uz_chats_v1';

const App: React.FC = () => {
  // App State
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  // Initialize sidebar closed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  
  // State for Legal Reference Modal
  const [activeLegalCategory, setActiveLegalCategory] = useState<LegalCategory>(null);

  // State for Law Reader
  const [activeLawDocument, setActiveLawDocument] = useState<string | null>(null);

  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Helper to rotate suggestions
  const refreshSuggestions = () => {
    const shuffled = [...SUGGESTED_QUESTIONS].sort(() => 0.5 - Math.random());
    setCurrentSuggestions(shuffled.slice(0, 4));
  };

  // Initial Load (Chats)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setChats(parsed);
      } catch (e) {
        console.error("Failed to parse chats", e);
      }
    }
    refreshSuggestions();
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
            behavior: isLoading ? 'auto' : 'smooth', 
            block: 'end' 
        });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        scrollToBottom();
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [chats, currentChatId, isLoading]);

  // Helpers
  const getCurrentChat = () => chats.find(c => c.id === currentChatId);

  const handleStartChatAnimation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        createNewChat();
        setIsTransitioning(false);
    }, 500);
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'Новая консультация',
      messages: [],
      isPinned: false,
      lastModified: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
    setMode(AppMode.TEXT);
    refreshSuggestions(); 
  };

  const handleSendMessage = async (val?: string) => {
    const textToSend = val || input;
    if (!textToSend.trim() || isLoading) return;

    let activeChatId = currentChatId;
    let activeChat = getCurrentChat();

    if (!activeChatId || !activeChat) {
      const newChat: Chat = {
        id: uuidv4(),
        title: 'Новая консультация',
        messages: [],
        isPinned: false,
        lastModified: Date.now()
      };
      setChats(prev => [newChat, ...prev]);
      activeChatId = newChat.id;
      activeChat = newChat;
      setCurrentChatId(newChat.id);
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: textToSend,
      timestamp: Date.now()
    };

    setChats(prev => prev.map(c => 
      c.id === activeChatId 
        ? { ...c, messages: [...c.messages, userMsg], lastModified: Date.now() } 
        : c
    ));
    setInput('');
    setIsLoading(true);

    const botMsgId = uuidv4();
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      role: Role.MODEL,
      text: '', 
      timestamp: Date.now()
    };

    setChats(prev => prev.map(c => 
      c.id === activeChatId 
        ? { ...c, messages: [...c.messages, botMsgPlaceholder] } 
        : c
    ));

    try {
      if (activeChat!.messages.length === 0) {
         generateTitle(userMsg.text).then(title => {
             setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, title } : c));
         });
      }

      let fullResponse = "";
      await sendMessageStream(activeChat!.messages, userMsg.text, (chunk) => {
        fullResponse += chunk;
        setChats(prev => prev.map(c => {
          if (c.id !== activeChatId) return c;
          const updatedMessages = c.messages.map(m => 
            m.id === botMsgId ? { ...m, text: fullResponse } : m
          );
          return { ...c, messages: updatedMessages };
        }));
      });

    } catch (error) {
      console.error(error);
      setChats(prev => prev.map(c => {
        if (c.id !== activeChatId) return c;
        const updatedMessages = c.messages.map(m => 
          m.id === botMsgId ? { ...m, text: "Произошла ошибка при получении ответа. Пожалуйста, проверьте подключение или повторите попытку.", isError: true } : m
        );
        return { ...c, messages: updatedMessages };
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePin = (id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  };

  const deleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setInput('');
      setMode(AppMode.TEXT);
    }
  };

  const handleGoHome = () => {
    playClickSound();
    setCurrentChatId(null);
    setMode(AppMode.TEXT);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const activeChat = getCurrentChat();
  const showHomeScreen = !currentChatId;

  return (
    <div className="flex h-screen overflow-hidden font-inter text-slate-900 dark:text-slate-100 relative">
      <AnimatedShaderBackground />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={(id) => { setCurrentChatId(id); setMode(AppMode.TEXT); }}
        onNewChat={handleStartChatAnimation}
        onDeleteChat={deleteChat}
        onTogglePin={togglePin}
        onGoHome={handleGoHome}
      />

      <div className="flex-1 flex flex-col h-full w-full relative transition-all duration-300 z-10 bg-transparent">
        
        <header className="h-16 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                playClickSound();
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <Menu size={24} />
            </button>

            {!showHomeScreen && (
                 <button
                    onClick={handleGoHome}
                    className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
                    title="Главное меню"
                  >
                    <ChevronLeft size={24} />
                    <span className="text-sm font-medium hidden sm:inline">Назад</span>
                  </button>
            )}

            <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleGoHome}
            >
              <Scale className="w-8 h-8 text-blue-600 hidden md:block" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">
                {showHomeScreen ? "AI LEGAL" : (activeChat?.title || "Новая консультация")}
              </h2>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {mode === AppMode.VOICE ? (
            <div className="absolute inset-0 z-20 p-4 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
              <VoiceInterface isActive={mode === AppMode.VOICE} onClose={() => setMode(AppMode.TEXT)} />
            </div>
          ) : (
            <div className="h-full w-full relative">
              
              {(showHomeScreen || isTransitioning) && (
                <div className={`absolute inset-0 z-10 h-full w-full`}>
                   <div className="h-full overflow-y-auto no-scrollbar">
                    <HomeScreen 
                      onStartChat={handleStartChatAnimation} 
                      onOpenCategory={setActiveLegalCategory}
                      isExiting={isTransitioning}
                    />
                  </div>
                </div>
              )}

              {(!showHomeScreen || isTransitioning) && (
                <div className={`absolute inset-0 z-20 h-full flex flex-col w-full ${!isTransitioning ? 'animate-page-enter' : ''}`}>
                    
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar"
                    >
                      {activeChat && activeChat.messages.length === 0 && !isTransitioning && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm animate-in fade-in duration-500">
                               <p>Чат создан. Напишите ваш вопрос.</p>
                          </div>
                      )}

                      {activeChat?.messages.map((msg, index) => {
                        const isLastMessage = index === activeChat.messages.length - 1;
                        const isStreaming = isLoading && isLastMessage && msg.role === Role.MODEL;
                        return (
                          <ChatMessage 
                              key={msg.id} 
                              message={msg} 
                              isStreaming={isStreaming} 
                          />
                        );
                      })}
                      <div ref={messagesEndRef} className="h-px w-full" />
                    </div>

                    <div className={`shrink-0 z-30 bg-transparent ${isTransitioning ? 'animate-slide-up-in' : ''}`}>
                        <ChatInput 
                        value={input}
                        onChange={setInput}
                        onSubmit={(val) => handleSendMessage(val)}
                        onVoiceClick={() => setMode(AppMode.VOICE)}
                        loading={isLoading}
                        placeholder="Задайте юридический вопрос..."
                        />
                    </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      <LegalReferenceModal 
        category={activeLegalCategory} 
        onClose={() => setActiveLegalCategory(null)}
        onDocumentOpen={setActiveLawDocument}
      />

      {activeLawDocument && (
        <LawReader 
            documentTitle={activeLawDocument} 
            onClose={() => setActiveLawDocument(null)} 
        />
      )}
    </div>
  );
};

export default App;
