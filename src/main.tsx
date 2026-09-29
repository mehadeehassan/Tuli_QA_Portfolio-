import './index.css';
import './styles/genesis-base.css';
import './lib/gateway-auth';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { StrictMode, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { GenesisRoot } from './lib/genesis';
import { setupThemeBridge } from './lib/theme-bridge';

setupThemeBridge();

const rootElement = document.getElementById('root')!;

function appHasOwnThemeProvider(): boolean {
  for (const script of rootElement.querySelectorAll('script:not([src])')) {
    const code = script.textContent ?? '';
    if (code.includes('documentElement') && code.includes('localStorage')) {
      return true;
    }
  }
  return false;
}

function getThemeStorageKey(): string {
  try {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)director-preview-access-token=([^;]+)/);
    const token =
      new URLSearchParams(window.location.search).get('accessToken') ??
      window.sessionStorage.getItem('director-preview-access-token') ??
      (cookieMatch ? cookieMatch[1] : null);
    if (token != null) {
      const segments = token.split('.');
      const payloadSegment = segments.length === 3 ? segments[1] : null;
      if (payloadSegment != null) {
        const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')));
        if (payload != null && payload.appId != null) {
          return `theme:${payload.spaceId}:${payload.appId}`;
        }
      }
    }
  } catch {
    // Fall back to the shared key
  }
  return 'theme';
}

const themeStorageKey = getThemeStorageKey();

function ThemeGate({ children }: { children: ReactNode }) {
  const [mountProvider, setMountProvider] = useState(false);
  useLayoutEffect(() => {
    if (!appHasOwnThemeProvider()) {
      setMountProvider(true);
    }
  }, []);
  if (!mountProvider) {
    return <>{children}</>;
  }
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey={themeStorageKey}
    >
      {children}
    </ThemeProvider>
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <GenesisRoot>
      <ThemeGate>
        <App />
      </ThemeGate>
    </GenesisRoot>
  </StrictMode>,
);
