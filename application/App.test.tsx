import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the useCachingFetch hook
jest.mock('../caching-fetch-library/cachingFetch', () => ({
  useCachingFetch: jest.fn(),
}));

describe('App', () => {
  const useCachingFetch = require('../caching-fetch-library/cachingFetch').useCachingFetch;

  beforeEach(() => {
    useCachingFetch.mockClear();
  });

  it('renders loading state', () => {
    useCachingFetch.mockReturnValue({ isLoading: true, data: null, error: null });

    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useCachingFetch.mockReturnValue({
      isLoading: false,
      data: null,
      error: new Error('Test error'),
    });

    render(<App />);
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('renders people list', () => {
    const mockData = [
      {
        first: 'John',
        last: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        balance: '$1000',
        created: '2023-01-01',
      },
      {
        first: 'Jane',
        last: 'Smith',
        email: 'jane@example.com',
        address: '456 Elm St',
        balance: '$2000',
        created: '2023-02-01',
      },
    ];

    useCachingFetch.mockReturnValue({
      isLoading: false,
      data: mockData,
      error: null,
    });

    render(<App />);

    expect(screen.getByText('Welcome to the People Directory')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('456 Elm St')).toBeInTheDocument();
    expect(screen.getByText('$2000')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
  });
});
