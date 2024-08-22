import { renderHook, act } from '@testing-library/react';
import { useCachingFetch, preloadCachingFetch, serializeCache, initializeCache, wipeCache } from './cachingFetch';

// Mock global fetch
global.fetch = jest.fn();

describe('cachingFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    wipeCache();
  });

  describe('useCachingFetch', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useCachingFetch('https://api.example.com/data'));
      expect(result.current).toEqual({
        isLoading: false,
        data: null,
        error: null,
      });
    });

    it('should fetch data and update state', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result, waitForNextUpdate } = renderHook(() => useCachingFetch('https://api.example.com/data'));

      expect(result.current.isLoading).toBe(true);

      await waitForNextUpdate();

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useCachingFetch('https://api.example.com/data'));

      expect(result.current.isLoading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  describe('preloadCachingFetch', () => {
    it('should preload data into cache', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch('https://api.example.com/data');

      const { result } = renderHook(() => useCachingFetch('https://api.example.com/data'));

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('serializeCache and initializeCache', () => {
    it('should serialize and initialize cache', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch('https://api.example.com/data');

      const serializedCache = serializeCache();
      wipeCache();

      initializeCache(serializedCache);

      const { result } = renderHook(() => useCachingFetch('https://api.example.com/data'));

      expect(result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});