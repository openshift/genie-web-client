import { createClientStateManager } from '@redhat-cloud-services/ai-client-state';
import { OLSClient } from './olsClient';

// Initialize state manager outside React scope
const client = new OLSClient({
  baseUrl: 'http://localhost:8080/',
  fetchFunction: (input, init) => fetch(input, init),
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
