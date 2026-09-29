import { gatewayRequest, isEmptyString } from '../../genesis-gateway';
import type { ClientOptions } from '../../genesis-gateway';
import {
  convoNonceCapableHeaders,
  convoNonceHeaders,
  rememberConvoNonceFromCreateResponse,
} from '../convoNonce';

export interface CreateConversationResponse {
  ok: boolean;
  conversationId: string;
  nonce?: string;
}

export const PUBLIC_CONVERSATION_LIST_MAX_IDS = 50;
export const PUBLIC_TRANSCRIPT_MAX_LIMIT = 100;

export interface ConversationSummary {
  conversationId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListConversationsResponse {
  ok: true;
  conversations: ConversationSummary[];
}

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface GetConversationResponse {
  ok: true;
  conversationId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TranscriptMessage[];
  nextCursor: string | null;
}

export interface AgentPublicProfile {
  ok: true;
  id: string;
  publicAgentId: string;
  name: string;
  avatar: { type: 'emoji'; value: string } | { type: 'image'; url: string } | null;
  introduction: string | null;
  conversationStarters: { text: string; prompt: string }[];
  inputPlaceholder: string | null;
  footerText: string | null;
  dismissableNotice: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | null;
    color: string | null;
    headerTitle: string | null;
    messageLayout: 'default' | 'bubble';
    showSuggestions: boolean;
  };
}

export type { ClientOptions };

export interface GetConversationOptions extends ClientOptions {
  cursor?: string;
  limit?: number;
}

function uniqueNonEmptyIds(conversationIds: readonly string[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const value of conversationIds) {
    const id = value.trim();
    if (id === '' || seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export async function createConversation(
  agentId: string,
  options?: ClientOptions,
): Promise<CreateConversationResponse> {
  if (isEmptyString(agentId)) {
    throw new Error('Agent ID cannot be empty');
  }

  const baseUrl = options?.baseUrl ?? '';
  const url = `${baseUrl}/api/taskade/agents/${encodeURIComponent(agentId)}/public-conversations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...convoNonceCapableHeaders(),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text().catch(() => '');

  if (!response.ok) {
    throw new Error(
      `Failed to create conversation: ${response.status} ${responseText || 'Unknown error'}`,
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Invalid response format: expected JSON, got ${contentType}`);
  }

  try {
    const data = JSON.parse(responseText) as CreateConversationResponse;
    rememberConvoNonceFromCreateResponse(data.conversationId, data);
    return data;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON response: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
  }
}

export async function listConversations(
  agentId: string,
  conversationIds: readonly string[],
  options?: ClientOptions,
): Promise<ListConversationsResponse> {
  if (isEmptyString(agentId)) {
    throw new Error('Agent ID cannot be empty');
  }

  const ids = uniqueNonEmptyIds(conversationIds);
  if (ids.length === 0) {
    throw new Error(
      'Pass conversation ids the client already stored. Listing every conversation for an agent is not supported because public conversations have no end-user identity.',
    );
  }
  if (ids.length > PUBLIC_CONVERSATION_LIST_MAX_IDS) {
    throw new Error(
      `A maximum of ${PUBLIC_CONVERSATION_LIST_MAX_IDS} conversation ids is allowed per request`,
    );
  }

  const query = `ids=${ids.map(encodeURIComponent).join(',')}`;
  return gatewayRequest<ListConversationsResponse>(
    `/agents/${encodeURIComponent(agentId)}/public-conversations?${query}`,
    { method: 'GET', headers: convoNonceHeaders(ids) },
    options,
  );
}

export async function getConversation(
  agentId: string,
  conversationId: string,
  options?: GetConversationOptions,
): Promise<GetConversationResponse> {
  if (isEmptyString(agentId)) {
    throw new Error('Agent ID cannot be empty');
  }
  if (isEmptyString(conversationId)) {
    throw new Error('Conversation ID cannot be empty');
  }

  const params = new URLSearchParams();
  const cursor = options?.cursor?.trim();
  if (cursor != null && cursor.length > 0) {
    params.set('cursor', cursor);
  }
  if (options?.limit != null) {
    const limit = options.limit;
    if (!Number.isInteger(limit) || limit < 1 || limit > PUBLIC_TRANSCRIPT_MAX_LIMIT) {
      throw new Error(`limit must be an integer between 1 and ${PUBLIC_TRANSCRIPT_MAX_LIMIT}`);
    }
    params.set('limit', String(limit));
  }
  const query = params.toString();
  const path = `/agents/${encodeURIComponent(agentId)}/public-conversations/${encodeURIComponent(conversationId)}`;

  return gatewayRequest<GetConversationResponse>(
    query === '' ? path : `${path}?${query}`,
    { method: 'GET', headers: convoNonceHeaders([conversationId]) },
    options,
  );
}

export async function getAgentProfile(
  agentId: string,
  options?: ClientOptions,
): Promise<AgentPublicProfile> {
  if (isEmptyString(agentId)) {
    throw new Error('Agent ID cannot be empty');
  }
  return gatewayRequest<AgentPublicProfile>(
    `/agents/${encodeURIComponent(agentId)}/public-profile`,
    { method: 'GET' },
    options,
  );
}
