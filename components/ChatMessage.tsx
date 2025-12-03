import React, { useEffect, useState } from 'react';
import { Message, Role } from '../types';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const useSmoothTyping = (text: string, isStreaming: boolean, speed: number = 20) => {
  const [displayedText, setDisplayedText] = useState(isStreaming ? '' : text);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    let intervalId: any;

    const animate = () => {
      setDisplayedText((current) => {
        if (current.length < text.length) {
          // Calculate how many characters to jump to keep up if falling behind
          // If the difference is huge (e.g. big chunk arrived), jump faster
          const diff = text.length - current.length;
          const jump = diff > 50 ? 5 : diff > 20 ? 3 : 1; 
          return text.slice(0, current.length + jump);
        }
        return current;
      });
    };

    intervalId = setInterval(animate, speed);
    return () => clearInterval(intervalId);
  }, [text, isStreaming, speed]);

  return displayedText;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === Role.USER;
  
  // Use smooth typing only if it's a model message and flagged as streaming
  const shouldAnimateTyping = !isUser && isStreaming;
  const displayedText = useSmoothTyping(message.text, shouldAnimateTyping);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-message-slide-in opacity-0`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-blue-600' : 'bg-indigo-600 dark:bg-indigo-500'}
        `}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col min-w-0 px-4 py-3 rounded-2xl shadow-sm border
          ${isUser 
            ? 'bg-blue-600 text-white rounded-tr-none border-blue-600' 
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-tl-none'}
        `}>
          {message.isError && (
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-2 text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={12} />
              Ошибка
            </div>
          )}
          
          <div className="text-sm md:text-base leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({children}) => <p className="mb-1.5 last:mb-0">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-4 mb-1.5 last:mb-0 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-4 mb-1.5 last:mb-0 space-y-1">{children}</ol>,
                li: ({children}) => <li className="pl-1">{children}</li>,
                h1: ({children}) => <h1 className="text-lg font-bold mt-2 mb-1">{children}</h1>,
                h2: ({children}) => <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>,
                h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                code: ({children}) => <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                strong: ({children}) => <strong className="font-bold">{children}</strong>,
                a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-600">{children}</a>
              }}
            >
                {shouldAnimateTyping ? displayedText : message.text}
            </ReactMarkdown>
            {shouldAnimateTyping && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-500 animate-cursor-blink" />
            )}
          </div>
          
          <span className={`text-[10px] mt-1 self-end ${isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;