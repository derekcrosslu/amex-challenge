import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the useCachingFetch hook
jest.mock('../caching-fetch-library/cachingFetch', () => ({
  useCachingFetch: jest.fn(),
}));

describe('App', () => {
  it('renders loading state', () => {
    const useCachingFetch = require('../caching-fetch-library/cachingFetch').useCachingFetch;
    useCachingFetch.mockReturnValue({ isLoading: true, data: null, error: null });

    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useCachingFetch = require('../caching-fetch-library/cachingFetch').useCachingFetch;
    useCachingFetch.mockReturnValue({ isLoading: false, data: null, error: new Error('Test error') });

    render(<App />);
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('renders people list', () => {
    const useCachingFetch = require('../caching-fetch-library/cachingFetch').useCachingFetch;
    useCachingFetch.mockReturnValue({
      isLoading: false,
      data: {
        results: [
          { id: '1', name: 'John Doe', age: '30' },
          { id: '2', name: 'Jane Smith', age: '25' },
        ]
      },
      error: null,
    });

    render(<App />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});