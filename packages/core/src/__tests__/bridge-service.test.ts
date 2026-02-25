import { BridgeService } from '../bridge-service.js';

describe('BridgeService', () => {
  let bridgeService: BridgeService;

  beforeEach(() => {
    bridgeService = new BridgeService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Request Management', () => {
    test('should create and store a pending request', async () => {
      const endpoint = '/api/test';
      const data = { test: 'data' };

      const requestPromise = bridgeService.sendRequest(endpoint, data);

      const pendingRequest = bridgeService.getPendingRequest();
      expect(pendingRequest).toBeTruthy();
      expect(pendingRequest?.request.endpoint).toBe(endpoint);
      expect(pendingRequest?.request.data).toEqual(data);
    });

    test('should resolve request when response is received', async () => {
      const endpoint = '/api/test';
      const data = { test: 'data' };
      const response = { result: 'success' };

      const requestPromise = bridgeService.sendRequest(endpoint, data);
      const pendingRequest = bridgeService.getPendingRequest();

      bridgeService.resolveRequest(pendingRequest!.requestId, response);

      const result = await requestPromise;
      expect(result).toEqual(response);
    });

    test('should reject request on error', async () => {
      const endpoint = '/api/test';
      const data = { test: 'data' };
      const error = 'Test error';

      const requestPromise = bridgeService.sendRequest(endpoint, data);
      const pendingRequest = bridgeService.getPendingRequest();

      bridgeService.rejectRequest(pendingRequest!.requestId, error);

      await expect(requestPromise).rejects.toEqual(error);
    });

    test('should timeout request after 25 seconds', async () => {
      const endpoint = '/api/test';
      const data = { test: 'data' };

      const requestPromise = bridgeService.sendRequest(endpoint, data);

      jest.advanceTimersByTime(26000);

      await expect(requestPromise).rejects.toThrow('Request timeout');
    });
  });

  describe('Cleanup Operations', () => {
    test('should clean up old requests', async () => {

      const promises = [
        bridgeService.sendRequest('/api/test1', {}),
        bridgeService.sendRequest('/api/test2', {}),
        bridgeService.sendRequest('/api/test3', {})
      ];

      jest.advanceTimersByTime(26000);

      bridgeService.cleanupOldRequests();

      for (const promise of promises) {
        await expect(promise).rejects.toThrow('Request timeout');
      }

      expect(bridgeService.getPendingRequest()).toBeNull();
    });

    test('should clear all pending requests on disconnect', async () => {

      const promises = [
        bridgeService.sendRequest('/api/test1', {}),
        bridgeService.sendRequest('/api/test2', {}),
        bridgeService.sendRequest('/api/test3', {})
      ];

      bridgeService.clearAllPendingRequests();

      for (const promise of promises) {
        await expect(promise).rejects.toThrow('Connection closed');
      }

      expect(bridgeService.getPendingRequest()).toBeNull();
    });
  });

  describe('Request Priority', () => {
    test('should return oldest request first', async () => {

      bridgeService.sendRequest('/api/test1', { order: 1 });

      jest.advanceTimersByTime(10);

      bridgeService.sendRequest('/api/test2', { order: 2 });

      jest.advanceTimersByTime(10);

      bridgeService.sendRequest('/api/test3', { order: 3 });

      const firstRequest = bridgeService.getPendingRequest();
      expect(firstRequest?.request.data.order).toBe(1);

      bridgeService.resolveRequest(firstRequest!.requestId, {});

      const secondRequest = bridgeService.getPendingRequest();
      expect(secondRequest?.request.data.order).toBe(2);

      bridgeService.resolveRequest(secondRequest!.requestId, {});

      const thirdRequest = bridgeService.getPendingRequest();
      expect(thirdRequest?.request.data.order).toBe(3);

      bridgeService.resolveRequest(thirdRequest!.requestId, {});

      expect(bridgeService.getPendingRequest()).toBeNull();
    });
  });

  describe('Dispatch Tracking', () => {
    test('should not return already dispatched request on subsequent polls', async () => {
      bridgeService.sendRequest('/api/test', { data: 'test' });

      const firstPoll = bridgeService.getPendingRequest();
      expect(firstPoll).toBeTruthy();
      expect(firstPoll?.request.endpoint).toBe('/api/test');

      const secondPoll = bridgeService.getPendingRequest();
      expect(secondPoll).toBeNull();
    });

    test('should re-dispatch request after redispatch timeout', async () => {
      bridgeService.sendRequest('/api/test', { data: 'test' });

      const firstPoll = bridgeService.getPendingRequest();
      expect(firstPoll).toBeTruthy();

      // Should not be returned immediately
      expect(bridgeService.getPendingRequest()).toBeNull();

      // Advance past the redispatch timeout (3s)
      jest.advanceTimersByTime(4000);

      // Should be re-dispatched now
      const rePoll = bridgeService.getPendingRequest();
      expect(rePoll).toBeTruthy();
      expect(rePoll?.request.endpoint).toBe('/api/test');
      expect(rePoll?.requestId).toBe(firstPoll?.requestId);
    });

    test('should return dispatched request again after resolve', async () => {
      const promise = bridgeService.sendRequest('/api/test', {});

      const firstPoll = bridgeService.getPendingRequest();
      expect(firstPoll).toBeTruthy();

      bridgeService.resolveRequest(firstPoll!.requestId, { ok: true });
      await promise;

      expect(bridgeService.getPendingRequest()).toBeNull();
    });

    test('should clear dispatch tracking on clearAllPendingRequests', async () => {
      const p1 = bridgeService.sendRequest('/api/test1', {});
      p1.catch(() => {});

      const firstPoll = bridgeService.getPendingRequest();
      expect(firstPoll).toBeTruthy();

      expect(bridgeService.getPendingRequest()).toBeNull();

      bridgeService.clearAllPendingRequests();

      expect(bridgeService.getPendingRequest()).toBeNull();
    });

    test('should dispatch multiple requests independently', async () => {
      bridgeService.sendRequest('/api/test1', { order: 1 });
      jest.advanceTimersByTime(10);
      bridgeService.sendRequest('/api/test2', { order: 2 });

      const first = bridgeService.getPendingRequest();
      expect(first?.request.data.order).toBe(1);

      const second = bridgeService.getPendingRequest();
      expect(second?.request.data.order).toBe(2);

      const third = bridgeService.getPendingRequest();
      expect(third).toBeNull();
    });
  });
});