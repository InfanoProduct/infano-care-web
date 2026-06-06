'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ChatService, ChatMessage } from '@/services/chat.service';

// ── Gigi link parser ────────────────────────────────────────────────────────
// Converts Gigi's [link:/path] tokens into clickable <Link> elements
function parseGigiMessage(text: string) {
  const parts = text.split(/(\[link:[^\]]+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[link:([^\]]+)\]$/);
    if (match) {
      const href = match[1];
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
}

// ── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center shrink-0 shadow-md">
        <Sparkles size={12} className="text-white" />
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
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === 'USER';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center shrink-0 shadow-md">
          <Sparkles size={12} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-rose-500 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
        }`}
      >
        {isUser ? msg.content : parseGigiMessage(msg.content)}
      </div>
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export function GigiChatWidget() {
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
    if (sessionId && messages.length === 0) {
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      sessionId: sessionId || '',
      sender: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await ChatService.sendMessage(text, sessionId || undefined);
      const gigiMsg = res?.message;
      const sid = res?.sessionId ?? sessionId ?? '';

      setSessionId(sid);

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMsg, sessionId: sid },
        ...(gigiMsg ? [gigiMsg] : []),
      ]);
    } catch {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  const chatPanel = isOpen ? (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div
        className="fixed inset-0 z-[998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat Card */}
      <div
        className="fixed z-[999] shadow-2xl rounded-3xl overflow-hidden flex flex-col bg-[#FAFAFA] border border-slate-150"
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
        <div className="shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">Gigi</p>
              <p className="text-white/70 text-[10px] font-semibold leading-none mt-0.5">Your AI big sister ✨</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-95"
              title="Minimize"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-95"
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
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : messages.length === 0 ? (
            // Welcome state
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center shadow-lg shadow-violet-200">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">Hey! I'm Gigi 👋</p>
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
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.filter(Boolean).map(msg => (
                <MessageBubble key={msg.id ?? Math.random()} msg={msg} />
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
            className="flex-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-150 rounded-2xl px-4 py-2.5 outline-none focus:border-violet-300 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-violet-200 hover:shadow-violet-300 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
      {/* Floating Trigger Button — sits above the WhatsApp button (bottom-6) */}
      <button
        onClick={handleOpen}
        className="fixed z-[997] bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-xl shadow-violet-300/50 hover:shadow-violet-400/60 hover:scale-110 transition-all duration-200 active:scale-95 flex items-center justify-center group"
        title="Chat with Gigi"
        aria-label="Open Gigi AI Assistant"
      >
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-rose-500 animate-ping opacity-30" />
        )}
        <Sparkles size={22} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Chat Panel via Portal */}
      {mounted && createPortal(chatPanel, document.body)}

      {/* Slide-up animation keyframe */}
      <style>{`
        @keyframes gigiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </>
  );
}
