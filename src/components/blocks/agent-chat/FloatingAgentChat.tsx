'use client';

import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ulid } from 'ulidx';

import { AIAssistantPanel } from '@/components/blocks/ai-assistant/AIAssistantPanel';
import { Button } from '@/components/ui/button';
import {
  createAgentChat,
  createConversation,
  getAgentProfile,
  resolveAgentChatDefaults,
  resolveChatErrorMessage,
  type AgentChatSuggestion,
  type AgentPublicProfile,
} from '@/lib/agent-chat/v2';
import { cn } from '@/lib/utils';

const ACCENT_BG = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  4: 'bg-chart-4',
  5: 'bg-chart-5',
} as const;

type AgentChat = ReturnType<typeof createAgentChat>;

export interface FloatingAgentChatProps {
  agentId?: string;
  publicAgentId?: string;
  title?: string;
  accent?: 1 | 2 | 3 | 4 | 5;
  accentColor?: string;
  suggestions?: readonly AgentChatSuggestion[];
  placeholder?: string;
  emptyDescription?: string;
  footerText?: string;
  notice?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function FloatingAgentChat({
  agentId,
  publicAgentId,
  title,
  accent,
  accentColor,
  suggestions,
  placeholder,
  emptyDescription,
  footerText,
  notice,
  defaultOpen = false,
  className,
}: FloatingAgentChatProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [chat, setChat] = useState<AgentChat | null>(null);
  const [chatError, setChatError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [profile, setProfile] = useState<AgentPublicProfile | null>(null);

  const sdkMode = agentId != null && agentId !== '';

  useEffect(() => {
    if (!sdkMode) {
      return;
    }
    let cancelled = false;
    getAgentProfile(agentId)
      .then((loaded) => {
        if (!cancelled) {
          setProfile(loaded);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sdkMode, agentId]);

  const appearance = resolveAgentChatDefaults(profile, {
    title,
    suggestions,
    placeholder,
    emptyDescription,
    accentColor,
    footerText,
    notice,
  });
  const resolvedTitle = appearance.title;
  const hostedUrl =
    publicAgentId != null && publicAgentId !== ''
      ? `https://www.taskade.com/a/${encodeURIComponent(publicAgentId)}`
      : null;

  const startChat = useCallback(async () => {
    if (!sdkMode || chat != null || starting) {
      return;
    }
    setStarting(true);
    try {
      const { conversationId } = await createConversation(agentId);
      setChat(createAgentChat(agentId, conversationId));
      setChatError(false);
    } catch {
      setChatError(true);
    } finally {
      setStarting(false);
    }
  }, [sdkMode, chat, starting, agentId]);

  useEffect(() => {
    if (open && sdkMode && chat == null && !chatError && !starting) {
      void startChat();
    }
  }, [open, sdkMode, chat, chatError, starting, startChat]);

  if (!sdkMode && hostedUrl == null) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
    void startChat();
  };

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
              data-genesis-block="floating-agent-chat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className={cn(
                'fixed inset-0 z-50 h-full w-full sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px]',
                className,
              )}
            >
              <div className="bg-card text-card-foreground flex h-full flex-col overflow-hidden border shadow-lg sm:rounded-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-foreground text-sm font-semibold">{resolvedTitle}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>

                {sdkMode && chat != null ? (
                  <ActiveChat
                    chat={chat}
                    title={resolvedTitle}
                    suggestions={appearance.suggestions}
                    placeholder={appearance.placeholder}
                    emptyDescription={appearance.emptyDescription}
                    footerText={appearance.footerText}
                    notice={appearance.notice}
                  />
                ) : sdkMode && chatError ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      The assistant is warming up - try again.
                    </p>
                    <Button onClick={() => void startChat()} disabled={starting}>
                      Try again
                    </Button>
                    {hostedUrl != null ? (
                      <a
                        href={hostedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground text-xs underline"
                      >
                        Open hosted chat
                      </a>
                    ) : null}
                  </div>
                ) : sdkMode ? (
                  <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                    Connecting...
                  </div>
                ) : hostedUrl != null ? (
                  <iframe
                    src={hostedUrl}
                    title={resolvedTitle}
                    allow="clipboard-read; clipboard-write"
                    className="h-full w-full flex-1 border-0"
                  />
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <Button
          onClick={handleOpen}
          data-genesis-block="floating-agent-chat"
          data-genesis-chat
          aria-label={`Open ${resolvedTitle}`}
          className={cn(
            'fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg',
            accent != null ? ACCENT_BG[accent] : 'bg-primary text-primary-foreground',
          )}
          style={
            accent == null && appearance.accentColor != null
              ? { backgroundColor: appearance.accentColor, color: appearance.accentForeground }
              : undefined
          }
        >
          <MessageCircle className="size-6" aria-hidden />
        </Button>
      ) : null}
    </>
  );
}

function ActiveChat({
  chat,
  title,
  suggestions,
  placeholder,
  emptyDescription,
  footerText,
  notice,
}: {
  chat: AgentChat;
  title: string;
  suggestions?: readonly AgentChatSuggestion[];
  placeholder?: string;
  emptyDescription?: string;
  footerText?: string;
  notice?: string;
}) {
  const { messages, status, stop, error, clearError, regenerate, addToolApprovalResponse } =
    useChat({
      chat,
      id: chat.id,
      experimental_throttle: 16,
    });
  const busy = status === 'submitted' || status === 'streaming';

  const errorMessage = resolveChatErrorMessage(error);

  const handleRetry = useCallback(() => {
    clearError();
    void regenerate().catch(() => {});
  }, [clearError, regenerate]);

  const handleSend = async (text: string) => {
    try {
      await chat.sendMessage({
        id: ulid(),
        role: 'user',
        parts: [{ type: 'text', text }],
      });
    } catch {
      // surfaced via useChat's `error`
    }
  };

  return (
    <AIAssistantPanel
      messages={messages}
      onSend={handleSend}
      busy={busy}
      status={status}
      onStop={stop}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onApprove={(id, approved) => addToolApprovalResponse({ id, approved })}
      title={title}
      suggestions={suggestions}
      placeholder={placeholder}
      emptyDescription={emptyDescription}
      footerText={footerText}
      notice={notice}
      className="rounded-none border-0"
    />
  );
}
