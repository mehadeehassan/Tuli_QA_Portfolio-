export interface ClientOptions {
  baseUrl?: string;
}

export interface GatewayResponse<TPayload = undefined> {
  ok: boolean;
  payload?: TPayload;
}

export function isEmptyString(value: string | null | undefined): boolean {
  return value == null || value.trim().length === 0;
}

let pendingRequestCount = 0;
let idleWaiters: Array<() => void> = [];

export function hasPendingGatewayRequests(): boolean {
  return pendingRequestCount > 0;
}

export function whenGatewayIdle(): Promise<void> {
  if (pendingRequestCount === 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    idleWaiters.push(resolve);
  });
}

function trackRequestSettled(): void {
  pendingRequestCount -= 1;
  if (pendingRequestCount === 0 && idleWaiters.length > 0) {
    const waiters = idleWaiters;
    idleWaiters = [];
    for (const resolve of waiters) {
      resolve();
    }
  }
}

const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const MAX_GET_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 300;
const MAX_BACKOFF_MS = 4000;
const ATTEMPT_TIMEOUT_MS = 30000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const expo = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
  return expo + Math.random() * BASE_BACKOFF_MS;
}

function retryAfterMs(response: Response): number | null {
  const header = response.headers.get('retry-after')?.trim();
  if (header == null || header.length === 0) {
    return null;
  }
  if (/^\d+$/.test(header)) {
    return Number.parseInt(header, 10) * 1000;
  }
  const dateMs = Date.parse(header);
  return Number.isNaN(dateMs) ? null : Math.max(0, dateMs - Date.now());
}

export async function gatewayRequest<TResponse>(
  path: string,
  init: RequestInit,
  options?: ClientOptions,
): Promise<TResponse> {
  pendingRequestCount += 1;
  try {
    return await performGatewayRequest<TResponse>(path, init, options);
  } finally {
    trackRequestSettled();
  }
}

async function performGatewayRequest<TResponse>(
  path: string,
  init: RequestInit,
  options?: ClientOptions,
): Promise<TResponse> {
  const response = await performGatewayFetch(path, init, options);
  return parseGatewayJson<TResponse>(response);
}

async function performGatewayFetch(
  path: string,
  init: RequestInit,
  options?: ClientOptions,
  acceptStatuses?: ReadonlySet<number>,
): Promise<Response> {
  const baseUrl = options?.baseUrl ?? '';
  const url = `${baseUrl}/api/taskade${path}`;
  const method = (init.method ?? 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? MAX_GET_ATTEMPTS : 1;

  for (let attempt = 1; ; attempt++) {
    const canRetry = attempt < maxAttempts;
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...init.headers,
        },
        signal: init.signal ?? AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        if (init.signal != null && err.name === 'AbortError') {
          throw err;
        }
        throw new Error(
          `Taskade gateway request timed out: ${method} ${path} gave no response within ${ATTEMPT_TIMEOUT_MS / 1000}s`,
          { cause: err },
        );
      }
      if (canRetry) {
        await delay(backoffMs(attempt));
        continue;
      }
      throw err;
    }

    if (!response.ok && !(acceptStatuses?.has(response.status) ?? false)) {
      if (canRetry && RETRYABLE_STATUSES.has(response.status)) {
        const hinted = retryAfterMs(response);
        if (hinted == null || hinted <= MAX_BACKOFF_MS) {
          await delay(hinted ?? backoffMs(attempt));
          continue;
        }
      }
      const responseText = await response.text().catch(() => '');
      throw new Error(
        `Taskade gateway request failed: ${response.status} ${responseText || 'Unknown error'}`,
      );
    }

    return response;
  }
}

async function parseGatewayJson<TResponse>(response: Response): Promise<TResponse> {
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text().catch(() => '');

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Invalid response format: expected JSON, got ${contentType}. Response: ${responseText.substring(0, 100)}`,
    );
  }

  try {
    return JSON.parse(responseText) as TResponse;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON response: ${err instanceof Error ? err.message : 'Unknown error'}. Response: ${responseText.substring(0, 200)}`,
      { cause: err },
    );
  }
}

export type ConditionalGetResult<TResponse> =
  | { changed: false; etag: string | null }
  | { changed: true; etag: string | null; body: TResponse };

const NOT_MODIFIED = new Set([304]);

export async function gatewayGetIfChanged<TResponse>(
  path: string,
  etag: string | null,
  options?: ClientOptions,
): Promise<ConditionalGetResult<TResponse>> {
  pendingRequestCount += 1;
  try {
    const response = await performGatewayFetch(
      path,
      {
        method: 'GET',
        headers: etag != null ? { 'If-None-Match': etag } : {},
        cache: 'no-store',
      },
      options,
      NOT_MODIFIED,
    );
    const nextEtag = response.headers.get('etag') ?? etag;
    if (response.status === 304) {
      return { changed: false, etag: nextEtag };
    }
    return { changed: true, etag: nextEtag, body: await parseGatewayJson<TResponse>(response) };
  } finally {
    trackRequestSettled();
  }
}
