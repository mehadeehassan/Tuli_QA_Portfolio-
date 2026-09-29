import { Chat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
  UIMessage,
  isToolUIPart,
} from 'ai';
import { ulid } from 'ulidx';

import { convoNonceHeaders } from '../convoNonce';
import type { ClientOptions } from './client';

export type ExtractInputMessagesResult = {
  history: UIMessage[];
  messages: UIMessage[];
};

function extractInputMessages(messages: UIMessage[]): ExtractInputMessagesResult {
  if (messages.length === 0) {
    return { history: messages, messages: [] };
  }

  const lastMessageIndex = messages.length - 1;
  const lastMessage = messages[lastMessageIndex];
  if (lastMessage == null) {
    return { history: messages, messages: [] };
  }

  if (lastMessage.role === 'user') {
    const history = messages.slice(0, lastMessageIndex);
    return { history, messages: [lastMessage] };
  }

  if (lastMessage.role === 'assistant') {
    const parts = lastMessage.parts;
    if (parts != null && parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      if (lastPart != null && isToolUIPart(lastPart)) {
        if (lastPart.state === 'output-available' || lastPart.state === 'output-error') {
          const history = messages.slice(0, lastMessageIndex);
          return { history, messages: [lastMessage] };
        }
      }
    }
  }

  const history = messages.slice(0, lastMessageIndex);
  return { history, messages: [lastMessage] };
}

const MAX_HISTORY_MESSAGES = 6;

export function createAgentChat(
  agentId: string,
  conversationId: string,
  options?: ClientOptions,
): Chat<UIMessage> {
  const baseUrl = options?.baseUrl ?? '';
  const api = `${baseUrl}/api/taskade/agents/${encodeURIComponent(agentId)}/public-conversations/${encodeURIComponent(conversationId)}/chat`;

  const chatState = new Chat<UIMessage>({
    messages: [],
    transport: new DefaultChatTransport({
      api,
      prepareSendMessagesRequest: (opts) => {
        const { history, messages } = extractInputMessages(opts.messages);

        const maxHistory = Math.max(0, MAX_HISTORY_MESSAGES - messages.length);
        const trimmedHistory = maxHistory === 0 ? [] : history.slice(-maxHistory);

        return {
          body: {
            messages,
            history: trimmedHistory,
          },
          headers: convoNonceHeaders([conversationId]),
        };
      },
    }),
    id: conversationId,
    generateId: ulid,
    sendAutomaticallyWhen: (options) => {
      const shouldSendAutomatically =
        lastAssistantMessageIsCompleteWithToolCalls(options) ||
        lastAssistantMessageIsCompleteWithApprovalResponses(options);
      if (!shouldSendAutomatically) {
        return false;
      }
      if (chatState.error != null) {
        return false;
      }
      return true;
    },
  });

  return chatState;
}
