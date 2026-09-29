'use client';

import { isToolUIPart, type ChatStatus, type ToolUIPart, type UIMessage } from 'ai';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { isAwaitingFirstToken } from '@/lib/agent-chat/v2/isAwaitingFirstToken';
import {
  suggestionLabel,
  suggestionPrompt,
  type AgentChatSuggestion,
} from '@/lib/agent-chat/v2/resolveAgentChatDefaults';
import { cn } from '@/lib/utils';

export const DEFAULT_ASSISTANT_SUGGESTIONS: readonly string[] = [
  'What can you help me with?',
  'Give me a quick overview',
  'Summarize what I have here',
  'What should I look at first?',
] as const;

export interface AIAssistantPanelProps {
  messages: UIMessage[];
  onSend: (text: string) => void | Promise<void>;
  busy?: boolean;
  status?: ChatStatus;
  onStop?: () => void;
  onApprove?: (id: string, approved: boolean) => void;
  errorMessage?: string;
  onRetry?: () => void;
  suggestions?: readonly AgentChatSuggestion[];
  title?: string;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  footerText?: string;
  notice?: string;
  className?: string;
}

function hashNoticeText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function hasRichPart(message: UIMessage): boolean {
  return message.parts.some((part) => isToolUIPart(part) || part.type === 'reasoning');
}

const TOOL_STATE_LABELS: Record<ToolUIPart['state'], string | null> = {
  'input-streaming': 'Working on it...',
  'input-available': 'Working on it...',
  'approval-requested': 'Needs your approval',
  'approval-responded': 'Working on it...',
  'output-available': null,
  'output-error': 'Something went wrong',
  'output-denied': 'Skipped',
};

export function AIAssistantPanel({
  messages,
  onSend,
  busy = false,
  status,
  onStop,
  onApprove,
  errorMessage,
  onRetry,
  suggestions = DEFAULT_ASSISTANT_SUGGESTIONS,
  title = 'Assistant',
  placeholder = 'Ask me anything…',
  emptyTitle = 'How can I help?',
  emptyDescription = 'Ask a question or pick a starter below.',
  footerText,
  notice,
  className,
}: AIAssistantPanelProps) {
  const noticeStorageKey = `genesis_agent_notice_${hashNoticeText(notice ?? '')}`;
  const [noticeDismissed, setNoticeDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(noticeStorageKey) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      setNoticeDismissed(sessionStorage.getItem(noticeStorageKey) === '1');
    } catch {
      setNoticeDismissed(false);
    }
  }, [noticeStorageKey]);
  const handleDismissNotice = () => {
    setNoticeDismissed(true);
    try {
      sessionStorage.setItem(noticeStorageKey, '1');
    } catch {
      // sessionStorage unavailable
    }
  };
  const isEmpty = messages.length === 0;
  const effectiveStatus: ChatStatus | undefined = status ?? (busy ? 'submitted' : undefined);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || busy) {
      return;
    }
    return onSend(text);
  };

  return (
    <Card
      data-genesis-block="ai-assistant-panel"
      className={cn(
        'bg-card text-card-foreground flex h-full min-h-0 flex-col overflow-hidden',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Sparkles className="text-muted-foreground size-4" aria-hidden />
        <span className="text-foreground text-sm font-semibold">{title}</span>
      </div>

      {notice != null && notice.trim() !== '' && !noticeDismissed ? (
        <div
          role="note"
          className="bg-muted text-muted-foreground flex shrink-0 items-start justify-between gap-2 border-b px-4 py-2 text-xs"
        >
          <span className="min-w-0 whitespace-pre-wrap break-words">{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={handleDismissNotice}
            className="hover:text-foreground shrink-0 px-1 font-semibold"
          >
            ✕
          </button>
        </div>
      ) : null}

      <Conversation>
        <ConversationContent>
          {isEmpty ? (
            <ConversationEmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={<Sparkles className="size-6" aria-hidden />}
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {hasRichPart(message) ? (
                    message.parts.map((part, i) => {
                      if (part.type === 'text') {
                        return <MessageResponse key={i}>{part.text}</MessageResponse>;
                      }
                      if (part.type === 'reasoning') {
                        return (
                          <Reasoning
                            key={i}
                            className="w-full"
                            isStreaming={part.state === 'streaming'}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }
                      if (isToolUIPart(part)) {
                        const statusLabel = TOOL_STATE_LABELS[part.state];
                        if (statusLabel == null) {
                          return null;
                        }
                        return (
                          <div
                            key={i}
                            className="text-muted-foreground my-1 flex flex-wrap items-center gap-2 text-xs"
                          >
                            <span className="italic">{statusLabel}</span>
                            {part.state === 'approval-requested' &&
                            part.approval != null &&
                            onApprove != null ? (
                              <span className="flex gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => onApprove(part.approval.id, true)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onApprove(part.approval.id, false)}
                                >
                                  Deny
                                </Button>
                              </span>
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <MessageResponse>{messageText(message)}</MessageResponse>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {isAwaitingFirstToken(messages, status) ? (
            <Message from="assistant" data-genesis-awaiting="">
              <MessageContent>
                <Shimmer duration={1}>Thinking...</Shimmer>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {errorMessage != null && errorMessage !== '' ? (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2" role="alert">
          <p className="text-destructive text-xs">{errorMessage}</p>
          {onRetry != null ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry} disabled={busy}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="px-4 pb-2">
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestionPrompt(suggestion)}
                suggestion={suggestionLabel(suggestion)}
                onClick={() => void onSend(suggestionPrompt(suggestion))}
                disabled={busy}
              />
            ))}
          </Suggestions>
        </div>
      ) : null}

      <div className="p-4 pt-0">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder={placeholder} disabled={busy} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit status={effectiveStatus} onStop={onStop} />
          </PromptInputFooter>
        </PromptInput>
        {footerText != null && footerText.trim() !== '' ? (
          <p className="text-muted-foreground whitespace-pre-wrap break-words pt-2 text-center text-[11px] leading-snug">
            {footerText}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
