export const CONVO_NONCE_HEADER = 'X-Taskade-Convo-Nonce';
export const CONVO_NONCE_CAPABLE_HEADER = 'X-Taskade-Convo-Nonce-Capable';

const STORAGE_KEY_PREFIX = 'taskade:agent-chat:convo-nonce:';
const memory = new Map<string, string>();

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || window.localStorage == null) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

export function rememberConvoNonce(conversationId: string, nonce: string): void {
  memory.set(conversationId, nonce);
  const store = storage();
  if (store == null) {
    return;
  }
  try {
    store.setItem(STORAGE_KEY_PREFIX + conversationId, nonce);
  } catch {
    // quota or disabled storage
  }
}

export function readConvoNonce(conversationId: string): string | null {
  const cached = memory.get(conversationId);
  if (cached != null) {
    return cached;
  }
  const store = storage();
  if (store == null) {
    return null;
  }
  try {
    const stored = store.getItem(STORAGE_KEY_PREFIX + conversationId);
    if (stored != null && stored !== '') {
      memory.set(conversationId, stored);
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export function rememberConvoNonceFromCreateResponse(
  conversationId: string,
  response: unknown,
): void {
  if (response == null || typeof response !== 'object') {
    return;
  }
  const { nonce } = response as { nonce?: unknown };
  if (typeof nonce === 'string' && nonce !== '') {
    rememberConvoNonce(conversationId, nonce);
  }
}

export function convoNonceCapableHeaders(): Record<string, string> {
  return { [CONVO_NONCE_CAPABLE_HEADER]: '1' };
}

export function convoNonceHeaders(conversationIds: readonly string[]): Record<string, string> {
  const nonces: string[] = [];
  const seen = new Set<string>();
  for (const conversationId of conversationIds) {
    const nonce = readConvoNonce(conversationId);
    if (nonce != null && !seen.has(nonce)) {
      seen.add(nonce);
      nonces.push(nonce);
    }
  }
  if (nonces.length === 0) {
    return {};
  }
  return { [CONVO_NONCE_HEADER]: nonces.join(',') };
}

export function clearConvoNoncesForTests(): void {
  memory.clear();
}
