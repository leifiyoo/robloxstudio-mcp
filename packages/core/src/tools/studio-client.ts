import { BridgeService } from '../bridge-service.js';

export class StudioHttpClient {
  private bridge: BridgeService;
  private maxRetries = 2;
  private retryDelayMs = 1000;

  constructor(bridge: BridgeService) {
    this.bridge = bridge;
  }

  async request(endpoint: string, data: any): Promise<any> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.bridge.sendRequest(endpoint, data);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.message === 'Connection closed') {
          throw new Error(
            'Studio plugin disconnected while processing request. The plugin may have been deactivated or Roblox Studio was closed.'
          );
        }

        if (lastError.message === 'Request timeout') {
          if (attempt < this.maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
            continue;
          }
          throw new Error(
            'Studio plugin connection timeout. The plugin appears connected but is not responding to requests. ' +
            'Try deactivating and reactivating the plugin in Roblox Studio.'
          );
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Request failed');
  }
}