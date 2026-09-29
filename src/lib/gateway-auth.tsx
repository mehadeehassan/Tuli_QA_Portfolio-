import * as React from 'react';
import { useAuth } from 'react-oidc-context';

let currentIdToken: string | null = null;

export function setGatewayIdToken(token: string | null): void {
  currentIdToken = token;
}

function isGatewayRequest(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl, window.location.origin);
    if (url.origin !== window.location.origin) {
      return false;
    }
    return (
      url.pathname.startsWith('/api/taskade/') || url.pathname.includes('/web-api/v1/gateways/')
    );
  } catch {
    return false;
  }
}

interface XHRWithGatewayUrl extends XMLHttpRequest {
  __taskadeGatewayUrl?: string;
}

type GatewayAuthWindow = Window & { __taskadeGatewayAuthInstalled__?: boolean };

function installGatewayAuthInterceptors(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const w = window as GatewayAuthWindow;
  if (w.__taskadeGatewayAuthInstalled__ === true) {
    return;
  }
  w.__taskadeGatewayAuthInstalled__ = true;

  const realFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (currentIdToken != null && isGatewayRequest(url)) {
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${currentIdToken}`);
      }
      return realFetch(input, { ...init, headers });
    }
    return realFetch(input, init);
  };

  const realOpen = window.XMLHttpRequest.prototype.open;
  const realSend = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.open = function patchedOpen(
    this: XHRWithGatewayUrl,
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    this.__taskadeGatewayUrl = typeof url === 'string' ? url : url.href;
    return realOpen.call(this, method, url, async ?? true, username, password);
  };
  window.XMLHttpRequest.prototype.send = function patchedSend(
    this: XHRWithGatewayUrl,
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const url = this.__taskadeGatewayUrl;
    if (currentIdToken != null && url != null && isGatewayRequest(url)) {
      try {
        this.setRequestHeader('Authorization', `Bearer ${currentIdToken}`);
      } catch {
        // ignore
      }
    }
    return realSend.call(this, body);
  };
}

installGatewayAuthInterceptors();

export function GatewayAuthSync(): null {
  const auth = useAuth();
  const idToken = auth.user?.id_token ?? null;
  React.useEffect(() => {
    setGatewayIdToken(idToken);
    return () => setGatewayIdToken(null);
  }, [idToken]);
  return null;
}
