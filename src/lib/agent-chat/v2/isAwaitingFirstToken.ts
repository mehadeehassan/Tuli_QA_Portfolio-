import type { ChatStatus, UIMessage } from 'ai';

export function isTailAssistantBlank(messages: UIMessage[]): boolean {
  const last = messages[messages.length - 1];
  if (last == null || last.role !== 'assistant') {
    return false;
  }
  return last.parts.every(
    (part) => part.type === 'step-start' || (part.type === 'text' && part.text.length === 0),
  );
}

export function isAwaitingFirstToken(
  messages: UIMessage[],
  status: ChatStatus | undefined,
): boolean {
  if (status === 'submitted') {
    return true;
  }
  return status === 'streaming' && isTailAssistantBlank(messages);
}
