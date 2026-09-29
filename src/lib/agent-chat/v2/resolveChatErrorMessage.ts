export const CHAT_ERROR_FALLBACK_MESSAGE = 'Something went wrong - please try again.';

export function resolveChatErrorMessage(error: unknown): string | undefined {
  if (error == null) {
    return undefined;
  }
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : undefined;
  if (message == null || message.trim() === '') {
    return CHAT_ERROR_FALLBACK_MESSAGE;
  }
  return unwrapErrorEnvelope(message);
}

function unwrapErrorEnvelope(message: string): string {
  const trimmed = message.trim();
  if (!trimmed.startsWith('{')) {
    return message;
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed != null && 'message' in parsed) {
      const inner = (parsed as { message?: unknown }).message;
      if (typeof inner === 'string' && inner.trim() !== '') {
        return inner;
      }
    }
  } catch {
    // not an envelope
  }
  return message;
}
