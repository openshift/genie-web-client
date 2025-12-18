import { createClientStateManager } from '@redhat-cloud-services/ai-client-state';
import { OLSClient } from './olsClient';

/**
 * Fetch function wrapper that adds CSRF token for console proxy requests
 */
const consoleFetchWithCSRF = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  // Get CSRF token from cookies
  const getCSRFToken = (): string | undefined => {
    const cookiePrefix = 'csrf-token=';
    return document?.cookie
      ?.split(';')
      .map((c) => c.trim())
      .filter((c) => c.startsWith(cookiePrefix))
      .map((c) => c.slice(cookiePrefix.length))
      .pop();
  };

  const csrfToken = getCSRFToken();

  // Convert existing headers to plain object
  const headersToObject = (headers?: HeadersInit): Record<string, string> => {
    if (!headers) return {};
    if (headers instanceof Headers) {
      const obj: Record<string, string> = {};
      headers.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    }
    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }
    return headers as Record<string, string>;
  };

  const existingHeaders = headersToObject(init?.headers);
  const headers: Record<string, string> = {
    ...existingHeaders, // Existing headers first
  };

  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  // Use native fetch to avoid consoleFetch stripping headers
  return fetch(input, { ...init, headers });
};

// Initialize state manager outside React scope
const client = new OLSClient({
  // Lightspeed operator is creating ConsolePlugin that is already configured to use the bridge proxy, so we need to use the same URL.
  // https://github.com/openshift/lightspeed-operator/blob/8aea14b4a532260fcbf64f1e7516be67fd2dc6c3/internal/controller/console/assets.go#L96-L131
  baseUrl: `${window.location.origin}/api/proxy/plugin/lightspeed-console-plugin/ols/`, // Always use bridge proxy
  fetchFunction: consoleFetchWithCSRF,
});

export const stateManager = createClientStateManager(client);

// Initialize immediately when module loads
stateManager
  .init()
  .then(() => {
    console.log('[Genie] State manager initialized successfully');
  })
  .catch((error) => {
    console.error('[Genie] State manager initialization failed:', error);
  });
