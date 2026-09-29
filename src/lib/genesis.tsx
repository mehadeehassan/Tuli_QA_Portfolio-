import * as React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useInRouterContext, useLocation } from 'react-router-dom';

import { hasPendingGatewayRequests, whenGatewayIdle } from './genesis-gateway';

declare global {
  interface Window {
    __TASKADE_APP_LIFECYCLE_LOGGER__?: { log: (...args: any[]) => void };
    __TASKADE_APP_READY__?: boolean;
  }
}

export function getGenesisAppLifecycleLogger() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.__TASKADE_APP_LIFECYCLE_LOGGER__ ?? null;
}

export type GenesisErrorCode = 'error.boundary' | 'error.runtime_error' | 'error.unhandled_promise';

const errorIds = new WeakMap<object, string>();
let lastPrimitiveError: string | null = null;
let lastPrimitiveErrorId: string | null = null;

function randomErrorId(): string {
  const cryptoObj = typeof globalThis.crypto === 'undefined' ? undefined : globalThis.crypto;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getGenesisErrorId(error: unknown): string {
  if (typeof error === 'object' && error != null) {
    const existing = errorIds.get(error);
    if (existing != null) {
      return existing;
    }
    const id = randomErrorId();
    errorIds.set(error, id);
    return id;
  }
  const key = String(error);
  if (lastPrimitiveError === key && lastPrimitiveErrorId != null) {
    return lastPrimitiveErrorId;
  }
  lastPrimitiveError = key;
  lastPrimitiveErrorId = randomErrorId();
  return lastPrimitiveErrorId;
}

const TELEMETRY_PATH = '/api/taskade/telemetry/errors';
const MAX_REPORTS_PER_SESSION = 5;
let reportsSent = 0;
const reportedSignatures = new Set<string>();

function sendGenesisErrorReport(payload: Record<string, unknown>) {
  try {
    void fetch(TELEMETRY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

function reportPublishedGenesisError(
  code: GenesisErrorCode,
  errorId: string,
  error: unknown,
  componentStack?: string | null,
) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return;
  }
  const message = (error instanceof Error ? error.message : String(error)) || 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;
  const signature = `${code}|${message}|${stack?.split('\n')[1] ?? ''}`;
  if (reportedSignatures.has(signature) || reportsSent >= MAX_REPORTS_PER_SESSION) {
    return;
  }
  reportedSignatures.add(signature);
  reportsSent += 1;

  sendGenesisErrorReport({
    errorId,
    code,
    message: message.slice(0, 4_000),
    stack: stack?.slice(0, 20_000),
    componentStack: componentStack?.slice(0, 20_000) ?? undefined,
    path: window.location.pathname.slice(0, 1_000),
    userAgent: window.navigator?.userAgent?.slice(0, 512),
  });
}

export function reportGenesisError(
  code: GenesisErrorCode,
  error: unknown,
  componentStack?: string | null,
): string {
  const errorId = getGenesisErrorId(error);
  const logger = getGenesisAppLifecycleLogger();

  if (logger != null) {
    logger.log({
      level: 'error',
      message: 'Runtime Error',
      data: {
        code,
        message: error instanceof Error ? error.message : String(error),
        stack: [error instanceof Error ? error.stack : undefined, componentStack]
          .filter(Boolean)
          .join('\n'),
      },
    });
    return errorId;
  }

  reportPublishedGenesisError(code, errorId, error, componentStack);
  return errorId;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const showRawError = getGenesisAppLifecycleLogger() != null;
  const errorId = getGenesisErrorId(error);
  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Something went wrong</h2>
      <p style={{ color: '#999', margin: '0 0 1rem', fontSize: '0.95rem' }}>
        The app encountered an error. You can try again, or refresh the page.
      </p>
      {showRawError && (
        <pre
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.8rem',
            color: '#dc2626',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {String(error)}
        </pre>
      )}
      {!showRawError && (
        <p style={{ color: '#999', margin: 0, fontSize: '0.8rem' }}>
          Error ID: <code>{errorId}</code>
        </p>
      )}
      <button
        type="button"
        onClick={resetErrorBoundary}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#1f2937',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try again
      </button>
    </div>
  );
}

function SectionErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const showRawError = getGenesisAppLifecycleLogger() != null;
  const message = error instanceof Error ? error.message : String(error);
  const isChunkLoadError =
    /loading( css)? chunk|dynamically imported module|failed to fetch dynamically/i.test(message);
  return (
    <div
      role="alert"
      style={{
        padding: '1.5rem',
        margin: '1rem',
        fontFamily: 'system-ui, sans-serif',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        background: '#fafafa',
        maxWidth: 520,
      }}
    >
      <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', color: '#111827' }}>
        This section hit an error
      </h3>
      <p style={{ color: '#6b7280', margin: '0 0 1rem', fontSize: '0.875rem' }}>
        The rest of the app still works.{' '}
        {isChunkLoadError
          ? 'Reload the page to recover this section.'
          : 'You can retry just this section.'}
      </p>
      {showRawError && (
        <pre
          style={{
            background: '#f5f5f5',
            padding: '0.75rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.75rem',
            color: '#dc2626',
            margin: '0 0 1rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {String(error)}
        </pre>
      )}
      {!showRawError && (
        <p style={{ color: '#9ca3af', margin: '0 0 1rem', fontSize: '0.75rem' }}>
          Error ID: <code>{getGenesisErrorId(error)}</code>
        </p>
      )}
      <button
        type="button"
        onClick={isChunkLoadError ? () => window.location.reload() : resetErrorBoundary}
        style={{
          padding: '0.4rem 0.9rem',
          background: '#1f2937',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
      >
        {isChunkLoadError ? 'Reload page' : 'Retry section'}
      </button>
    </div>
  );
}

function SectionLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: '#9ca3af',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
      }}
    >
      Loading…
    </div>
  );
}

interface GenesisSectionProps {
  children: React.ReactNode;
  name?: string;
  resetKeys?: unknown[];
}

function SectionBoundary({ children, name, resetKeys }: GenesisSectionProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={SectionErrorFallback}
      resetKeys={resetKeys}
      onError={(error, info) => {
        console.error(`[Genesis] Section error${name ? ` (${name})` : ''}:`, error, info);
        reportGenesisError('error.boundary', error, info.componentStack);
      }}
    >
      <React.Suspense fallback={<SectionLoadingFallback />}>{children}</React.Suspense>
    </ReactErrorBoundary>
  );
}

function RoutedSectionBoundary(props: GenesisSectionProps) {
  const { pathname } = useLocation();
  return <SectionBoundary {...props} resetKeys={[pathname, ...(props.resetKeys ?? [])]} />;
}

export function GenesisSection(props: GenesisSectionProps) {
  const inRouter = useInRouterContext();
  return inRouter ? <RoutedSectionBoundary {...props} /> : <SectionBoundary {...props} />;
}

if (typeof window !== 'undefined') {
  window.__TASKADE_APP_READY__ = false;
}

function nextPaintedFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function AppReadyMarker() {
  React.useEffect(() => {
    let cancelled = false;
    const declareReadyWhenSettled = async () => {
      do {
        await whenGatewayIdle();
        await nextPaintedFrame();
        if (cancelled) {
          return;
        }
      } while (hasPendingGatewayRequests());
      window.__TASKADE_APP_READY__ = true;
    };
    void declareReadyWhenSettled();
    return () => {
      cancelled = true;
      window.__TASKADE_APP_READY__ = false;
    };
  }, []);
  return null;
}

export function GenesisRoot({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('[Genesis] Uncaught render error:', error, info);
        reportGenesisError('error.boundary', error, info.componentStack);
      }}
      onReset={() => {
        console.info('[Genesis] User reset error boundary');
      }}
    >
      {children}
      <AppReadyMarker />
    </ReactErrorBoundary>
  );
}
