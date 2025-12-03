import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onVoiceClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onVoiceClick,
  placeholder = "Type your message here...",
  disabled = false,
  loading = false,
}: ChatInputProps) {
  
  // Auto-resize logic integration with Shadcn Textarea
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !loading && onSubmit) {
      playClickSound();
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full p-4 flex justify-center">
      <form 
        className="w-full max-w-3xl relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:ring-1 focus-within:ring-blue-500/50 p-1 shadow-sm transition-shadow hover:shadow-md"
        onSubmit={handleSubmit}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="min-h-12 resize-none rounded-xl bg-transparent border-0 p-3 shadow-none focus-visible:ring-0 text-base max-h-[200px]"
        />
        
        <div className="flex items-center p-2 pt-0 justify-between">
          <div className="flex items-center gap-1">
             <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={() => playClickSound()}
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
             >
                <Paperclip className="size-4" />
                <span className="sr-only">Attach file</span>
             </Button>

             <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={() => {
                  playClickSound();
                  if (onVoiceClick) onVoiceClick();
                }}
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
             >
                <Mic className="size-4" />
                <span className="sr-only">Use Microphone</span>
             </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!value.trim() || loading || disabled}
            className={cn(
                "ml-auto gap-1.5 transition-all duration-200",
                value.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            )}
            onClick={() => {
               if (value.trim()) playClickSound();
            }}
          >
            {loading ? (
                <>
                    <span>Отправка...</span>
                    <Loader2 className="size-3.5 animate-spin" />
                </>
            ) : (
                <>
                    <span>Отправить</span>
                    <CornerDownLeft className="size-3.5" />
                </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}