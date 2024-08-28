import { renderHook, act } from '@testing-library/react';
import {
  useCachingFetch,
  preloadCachingFetch,
  serializeCache,
  initializeCache,
  wipeCache,
} from './cachingFetch';

// Mock global fetch
global.fetch = jest.fn();

const API_URL = 'https://randomapi.com/api/6de6abfedb24f889e0b5f675edc50deb';

describe('cachingFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    wipeCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useCachingFetch', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useCachingFetch(API_URL));
      expect(result.current).toEqual({
        isLoading: false,
        data: null,
        error: null,
      });
    });

    it('should fetch data and update state', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useCachingFetch(API_URL));

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useCachingFetch(API_URL));

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
    });

    it('should return cached data within expiration time', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result, rerender } = renderHook(() => useCachingFetch(API_URL));

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      rerender();

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fetch new data after cache expiration', async () => {
      const mockData1 = { results: [{ id: 1, name: 'Test 1' }] };
      const mockData2 = { results: [{ id: 2, name: 'Test 2' }] };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData2),
        });

      const { result, rerender } = renderHook(() => useCachingFetch(API_URL));

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData1,
        error: null,
      });

      // Move time forward past cache expiration
      jest.advanceTimersByTime(61 * 1000);

      rerender();

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData2,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('preloadCachingFetch', () => {
    it('should preload data into cache', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch(API_URL);

      const { result } = renderHook(() => useCachingFetch(API_URL));

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle preload errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await preloadCachingFetch(API_URL);

      expect(consoleSpy).toHaveBeenCalledWith('Error preloading data:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('serializeCache and initializeCache', () => {
    it('should serialize and initialize cache', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch(API_URL);

      const serializedCache = serializeCache();
      wipeCache();

      initializeCache(serializedCache);

      const { result } = renderHook(() => useCachingFetch(API_URL));

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid serialized cache', () => {
      const invalidSerializedCache = 'invalid JSON';

      expect(() => initializeCache(invalidSerializedCache)).toThrow();
    });
  });

  describe('wipeCache', () => {
    it('should clear all cached data', async () => {
      const mockData1 = { results: [{ id: 1, name: 'Test 1' }] };
      const mockData2 = { results: [{ id: 2, name: 'Test 2' }] };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData2),
        });

      await preloadCachingFetch(API_URL);
      await preloadCachingFetch(`${API_URL}?param=1`);

      wipeCache();

      const { result: result1 } = renderHook(() => useCachingFetch(API_URL));
      const { result: result2 } = renderHook(() => useCachingFetch(`${API_URL}?param=1`));

      expect(result1.current.isLoading).toBe(true);
      expect(result2.current.isLoading).toBe(true);

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(result1.current).toEqual({
        isLoading: false,
        data: mockData1,
        error: null,
      });
      expect(result2.current).toEqual({
        isLoading: false,
        data: mockData2,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(4); // 2 for preload, 2 for fetching after wipe
    });
  });
});
