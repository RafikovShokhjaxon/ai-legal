
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { GeminiLiveService } from '../services/liveService';
import { AIVoiceInput } from './ui/ai-voice-input';

interface VoiceInterfaceProps {
  isActive: boolean;
  onClose: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isActive, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const liveServiceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    setStatus('connecting');
    try {
      liveServiceRef.current = new GeminiLiveService();
      
      await liveServiceRef.current.connect(() => {
        setStatus('disconnected');
      });
      setStatus('connected');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const disconnect = async () => {
    if (liveServiceRef.current) {
      await liveServiceRef.current.disconnect();
      liveServiceRef.current = null;
    }
    setStatus('disconnected');
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto bg-white/40 dark:bg-slate-950/50 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
      
      <button 
        onClick={() => { disconnect(); onClose(); }}
        className="absolute top-4 right-4 p-2 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-20 text-slate-600 dark:text-slate-300 backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      <div className="z-10 text-center space-y-8 w-full">
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white bg-clip-text">Голосовой Ассистент</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                {status === 'connecting' && "Подключение к AI LEGAL..."}
                {status === 'error' && <span className="text-red-500">Ошибка подключения.</span>}
                {status === 'disconnected' && "Готов к работе"}
            </p>
        </div>

        {/* AI Voice Input Component with Theme Styles */}
        <div className="flex justify-center">
            <AIVoiceInput 
                onStart={connect}
                onStop={disconnect}
                className="bg-white/50 dark:bg-black/20 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-inner"
                visualizerBars={32}
            />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs mx-auto">
            Используется модель Gemini Live.
        </p>
      </div>
    </div>
  );
};

export default VoiceInterface;
