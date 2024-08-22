import { useState, useEffect } from 'react';

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: unknown;
  error: Error | null;
};

interface CacheItem {
  data: unknown;
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_EXPIRATION = 60 * 1000; // 1 minute

const fetchData = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useCachingFetch: UseCachingFetch = (url) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCachedData = async () => {
      if (cache[url] && Date.now() - cache[url].timestamp < CACHE_EXPIRATION) {
        setData(cache[url].data);
        return;
      }

      setIsLoading(true);
      try {
        const result = await fetchData(url);
        cache[url] = { data: result, timestamp: Date.now() };
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCachedData();
  }, [url]);

  return { isLoading, data, error };
};

export const preloadCachingFetch = async (url: string): Promise<void> => {
  try {
    const result = await fetchData(url);
    cache[url] = { data: result, timestamp: Date.now() };
  } catch (err) {
    console.error('Error preloading data:', err);
  }
};

export const serializeCache = (): string => {
  return JSON.stringify(cache);
};

export const initializeCache = (serializedCache: string): void => {
  const parsedCache = JSON.parse(serializedCache);
  Object.assign(cache, parsedCache);
};

export const wipeCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};
