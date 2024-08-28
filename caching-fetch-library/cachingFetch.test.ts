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
  });

  describe('useCachingFetch', () => {
    it('should return initial state and then load data', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      let result: any;
      await act(async () => {
        result = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initial state
      expect(result.result.current).toEqual({
        isLoading: true,
        data: null,
        error: null,
      });

      // Wait for data to be fetched
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Final state with data
      expect(result.result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      let result: any;
      await act(async () => {
        result = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Final state with error
      expect(result.result.current).toEqual({
        isLoading: false,
        data: null,
        error: new Error(errorMessage),
      });
    });

    it('should return cached data within expiration time', async () => {
      const mockData = { results: [{ id: 1, name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      // First render
      let result1: any;
      await act(async () => {
        result1 = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result1.result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      // Second render (should use cached data)
      let result2: any;
      await act(async () => {
        result2 = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result2.result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
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

      let result: any;
      await act(async () => {
        result = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
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

      let result: any;
      await act(async () => {
        result = renderHook(() => useCachingFetch(API_URL));
        // Wait for all state updates
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.result.current).toEqual({
        isLoading: false,
        data: mockData,
        error: null,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
