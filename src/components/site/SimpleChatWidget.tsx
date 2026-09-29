'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SimpleChatWidgetProps {
  title?: string;
  placeholder?: string;
  greeting?: string;
  className?: string;
}

/**
 * A minimal, self-contained floating chat widget that talks to `/api/chat`
 * (a Vercel serverless function — see /api/chat.ts). No external chat SDK,
 * no Taskade gateway — works on any host that runs the /api function
 * (Vercel, or any Node server you wire the same route up on).
 */
export function SimpleChatWidget({
  title = 'Ask about Tuli',
  placeholder = 'Ask about her experience, skills...',
  greeting = "Hi! Ask me anything about Tuli's QA experience, skills, or background.",
  className,
}: SimpleChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) {
      return;
    }
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <div
              className="bg-foreground/20 fixed inset-0 z-40 sm:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className={cn(
                'fixed inset-0 z-50 h-full w-full sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[380px]',
                className,
              )}
            >
              <div className="bg-card text-card-foreground flex h-full flex-col overflow-hidden border shadow-lg sm:rounded-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-foreground text-sm font-semibold">{title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{greeting}</p>
                  ) : null}
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex w-fit max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-foreground',
                      )}
                    >
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    </div>
                  ))}
                  {busy ? (
                    <div className="bg-muted text-muted-foreground w-fit rounded-lg px-3 py-2 text-sm italic">
                      Thinking...
                    </div>
                  ) : null}
                  {error ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-destructive text-xs" role="alert">
                        {error}
                      </p>
                    </div>
                  ) : null}
                </div>

                <form
                  className="flex items-center gap-2 border-t p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    disabled={busy}
                    className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                  <Button type="submit" size="icon" disabled={busy || !input.trim()}>
                    <Send className="size-4" aria-hidden />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          aria-label={`Open ${title}`}
          className="bg-primary text-primary-foreground fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg"
        >
          <MessageCircle className="size-6" aria-hidden />
        </Button>
      ) : null}
    </>
  );
}
