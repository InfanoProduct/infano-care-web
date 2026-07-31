'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatService, ChatMessage } from '@/services/chat.service';
import { useAuthStore } from '@/store/auth-store';

// ── Gigi link parser ────────────────────────────────────────────────────────
// Converts Gigi's [link:/path] and [option:Label|Value] tokens
interface ParsedMessage {
  renderedText: React.ReactNode;
  options: { label: string; value: string }[];
}

function parseGigiMessage(text: string): ParsedMessage {
  // Extract all options (allow flexible spacing around brackets, option keyword, and colon)
  const optionRegex = /\[\s*option\s*:\s*([^\]]+?)\s*\]/g;
  const options: { label: string; value: string }[] = [];
  let match;
  
  while ((match = optionRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    const [label, val] = raw.split('|');
    options.push({ label: label.trim(), value: (val || label).trim() });
  }

  // Remove option patterns from the main message text
  const cleanedText = text.replace(/\[\s*option\s*:\s*[^\]]+?\s*\]/g, '').trim();

  // Split and render links
  const parts = cleanedText.split(/(\[link:[^\]]+\])/g);
  const renderedText = parts.map((part, i) => {
    const linkMatch = part.match(/^\[link:([^\]]+)\]$/);
    if (linkMatch) {
      const href = linkMatch[1];
      return (
        <Link
          key={i}
          href={href}
          className="inline underline text-primary font-bold hover:text-primary/80 transition-colors"
        >
          Open →
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return { renderedText, options };
}

// ── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-purple-150 overflow-hidden bg-purple-50">
        <img src="/gigi-avatar.png" alt="Gigi" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onOptionClick }: { msg: ChatMessage; onOptionClick?: (val: string) => void }) {
  const isUser = msg.sender === 'USER';

  if (isUser) {
    return (
      <div className="flex items-end gap-2 justify-end">
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs bg-purple-100 border border-purple-200/60 text-purple-950 rounded-br-sm font-medium">
          {msg.content}
        </div>
      </div>
    );
  }

  // Parse GIGI message text and options
  const { renderedText, options } = parseGigiMessage(msg.content);

  return (
    <div className="flex flex-col gap-2">
      {/* Text Bubble Row */}
      <div className="flex items-end gap-2 justify-start">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-purple-150 overflow-hidden bg-purple-50">
          <img src="/gigi-avatar.png" alt="Gigi" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs bg-white border border-slate-100 text-slate-700 rounded-bl-sm">
          <div className="whitespace-pre-wrap">{renderedText}</div>
        </div>
      </div>

      {/* Options Row - Positioned directly below the text bubble, indented to align nicely */}
      {options.length > 0 && (
        <div className="pl-9 pr-4 flex flex-col gap-1.5 w-full items-start">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onOptionClick?.(opt.value)}
              className="w-full max-w-[260px] text-left text-xs font-semibold px-4 py-3 rounded-2xl bg-white border border-purple-100/80 hover:border-purple-300 text-purple-950 hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-pink-50/80 hover:text-purple-800 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] shadow-xs flex items-center justify-between group cursor-pointer"
            >
              <span>{opt.label}</span>
              <svg className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export function GigiChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load history when first opening with existing session
  const handleOpen = async () => {
    setIsOpen(true);
    if (isAuthenticated && sessionId && messages.length === 0) {
      setLoadingHistory(true);
      try {
        const history = await ChatService.getHistory(sessionId);
        setMessages(history);
      } catch {
        // silently fail — user can still chat
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  // Debounce: prevent rapid-fire sends within 500ms
  const sendDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSendTimeRef = useRef<number>(0);

  const sendText = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const now = Date.now();
    const timeSinceLastSend = now - lastSendTimeRef.current;

    if (sendDebounceRef.current) {
      clearTimeout(sendDebounceRef.current);
    }

    if (timeSinceLastSend < 500) {
      // Queue for later
      sendDebounceRef.current = setTimeout(() => {
        lastSendTimeRef.current = Date.now();
        sendText(cleanText);
      }, 500 - timeSinceLastSend);
      return;
    }

    lastSendTimeRef.current = now;

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      sessionId: sessionId || '',
      sender: 'USER',
      content: cleanText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build clean history payload for stateful guest chats, capped to the last 10 messages
      const historyPayload = messages
        .filter(m => !m.id.startsWith('temp-') && !m.id.startsWith('err-'))
        .slice(-10)
        .map(m => ({
          sender: m.sender,
          content: m.content
        }));

      const res = await ChatService.sendMessage(
        cleanText,
        sessionId || undefined,
        undefined,
        historyPayload
      );
      const gigiMsg = res?.message;
      const sid = res?.sessionId ?? sessionId ?? '';

      setSessionId(sid);

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMsg, sessionId: sid },
        ...(gigiMsg ? [gigiMsg] : []),
      ]);
    } catch (err) {
      console.error("Gigi Chat widget error:", err);
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        userMsg,
        {
          id: `err-${Date.now()}`,
          sessionId: sessionId || '',
          sender: 'GIGI',
          content: "I'm having a little trouble connecting right now. Give me a moment and try again! 💙",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendText(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cleanPathname = pathname ? pathname.replace(/^\/en-(us|uk)/, '') : '';
  const isExcludedPage = 
    cleanPathname.startsWith('/admin') || 
    cleanPathname.startsWith('/peerline') || 
    cleanPathname.startsWith('/dashboard/peer-training') ||
    cleanPathname.startsWith('/checkout') ||
    cleanPathname.startsWith('/gigi-the-awkward-age-book') ||
    cleanPathname.startsWith('/webinar');

  if (!mounted || isExcludedPage) return null;

  const chatPanel = isOpen ? (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div
        className="fixed inset-0 z-[998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat Card */}
      <div
        className="fixed z-[999] shadow-2xl rounded-3xl overflow-hidden flex flex-col bg-[#FCF9F7] border border-purple-100/50"
        style={{
          bottom: '156px',
          right: '24px',
          width: 'min(360px, calc(100vw - 32px))',
          height: '480px',
          animation: 'gigiSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-50 border-b border-purple-200/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-purple-200/80 overflow-hidden bg-purple-50 shadow-sm flex items-center justify-center">
              <img src="/gigi-avatar.png" alt="Gigi Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-purple-950 font-black text-sm leading-none">Gigi</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-purple-950/5 hover:bg-purple-950/15 flex items-center justify-center text-purple-900 transition-all active:scale-95"
              title="Minimize"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-purple-950/5 hover:bg-purple-950/15 flex items-center justify-center text-purple-900 transition-all active:scale-95"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : messages.length === 0 ? (
            // Welcome state
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-2">
              <div className="w-16 h-16 rounded-full border-2 border-purple-200/80 overflow-hidden bg-purple-50 shadow-md">
                <img src="/gigi-avatar.png" alt="Gigi Welcome" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-black text-purple-950 text-sm">Hey! I'm Gigi 👋</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your safe space to talk about anything — feelings, school stress, periods, or just life.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                {["I'm feeling stressed 😔", "Period questions ❓", "Just talk 💬"].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-150 hover:bg-purple-100 transition-colors active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.filter(Boolean).map(msg => (
                <MessageBubble key={msg.id ?? Math.random()} msg={msg} onOptionClick={sendText} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-3 flex items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Gigi..."
            disabled={isLoading}
            className="flex-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-150 rounded-2xl px-4 py-2.5 outline-none focus:border-purple-300 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 border border-purple-300/30 text-purple-950 flex items-center justify-center shadow-md shadow-purple-100 hover:shadow-purple-200 hover:from-purple-300 hover:to-pink-300 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Floating Trigger Button Wrapper — sits above the WhatsApp button (bottom-6) */}
      <div 
        className="fixed z-[997] bottom-24 right-6 gigi-float-container"
      >
        <button
          onClick={handleOpen}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 text-purple-950 shadow-xl shadow-purple-200/50 hover:shadow-purple-300/60 hover:scale-110 border border-purple-300/30 transition-all duration-200 active:scale-95 flex items-center justify-center group overflow-hidden"
          title="Chat with Gigi"
          aria-label="Open Gigi AI Assistant"
        >
          {/* Pulse ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 animate-ping opacity-30" />
          )}
          <div className="relative z-10 w-11 h-11 rounded-full overflow-hidden border border-purple-300/40 shadow-sm bg-white flex items-center justify-center">
            <img 
              src="/gigi-avatar.png" 
              alt="Gigi Avatar" 
              className="w-full h-full object-cover gigi-avatar-wiggle" 
            />
          </div>
        </button>
      </div>

      {/* Chat Panel via Portal */}
      {mounted && createPortal(chatPanel, document.body)}

      {/* Animations style block */}
      <style>{`
        @keyframes gigiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes gigiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gigiWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-6deg); }
          75% { transform: rotate(6deg); }
        }
        .gigi-float-container {
          animation: gigiFloat 3s ease-in-out infinite;
        }
        .gigi-float-container:hover {
          animation-play-state: paused;
        }
        .gigi-avatar-wiggle {
          transform-origin: bottom center;
          transition: transform 0.3s ease;
        }
        .gigi-float-container:hover .gigi-avatar-wiggle {
          animation: gigiWiggle 0.6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
