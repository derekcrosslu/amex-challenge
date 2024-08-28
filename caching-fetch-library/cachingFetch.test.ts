import { renderHook, waitFor } from '@testing-library/react';
import {
  useCachingFetch,
  preloadCachingFetch,
  serializeCache,
  initializeCache,
  wipeCache,
} from './cachingFetch';

global.fetch = jest.fn();

const API_URL = 'https://randomapi.com/api/6de6abfedb24f889e0b5f675edc50deb';

describe('cachingFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    wipeCache();
  });

  describe('useCachingFetch', () => {
    it('should return initial state and then load data', async () => {
      const mockData = { results: [{ id: '1', name: 'Test', age: '30' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useCachingFetch(API_URL));

      expect(result.current).toEqual({
        isLoading: true,
        data: null,
        error: null,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          isLoading: false,
          data: mockData,
          error: null,
        });
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useCachingFetch(API_URL));

      await waitFor(() => {
        expect(result.current).toEqual({
          isLoading: false,
          data: null,
          error: new Error(errorMessage),
        });
      });
    });

    it('should return cached data within expiration time', async () => {
      const mockData = { results: [{ id: '1', name: 'Test', age: '30' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result: result1 } = renderHook(() => useCachingFetch(API_URL));
      await waitFor(() => expect(result1.current.isLoading).toBe(false));

      const { result: result2 } = renderHook(() => useCachingFetch(API_URL));
      await waitFor(() => expect(result2.current.isLoading).toBe(false));

      expect(result1.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });
      expect(result2.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadCachingFetch', () => {
    it('should preload data into cache', async () => {
      const mockData = { results: [{ id: '1', name: 'Test', age: '30' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch(API_URL);

      const { result } = renderHook(() => useCachingFetch(API_URL));

      await waitFor(() => {
        expect(result.current).toEqual({
          isLoading: false,
          data: mockData,
          error: null,
        });
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('serializeCache and initializeCache', () => {
    it('should serialize and initialize cache', async () => {
      const mockData = { results: [{ id: '1', name: 'Test', age: '30' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await preloadCachingFetch(API_URL);

      const serializedCache = serializeCache();
      wipeCache();

      initializeCache(serializedCache);

      const { result } = renderHook(() => useCachingFetch(API_URL));

      await waitFor(() => {
        expect(result.current).toEqual({
          isLoading: false,
          data: mockData,
          error: null,
        });
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
