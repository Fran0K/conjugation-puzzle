import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { LanguageProvider } from '../LanguageContext';
import * as SupabaseService from '../services/supabase';
import { mockPuzzleData } from './mocks/data';

// Mock the DB fetch function
vi.mock('../services/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof SupabaseService>();
  return {
    ...actual,
    fetchRandomPuzzleFromDB: vi.fn(),
  };
});

const renderApp = () => {
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
};

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockReturnValue(new Promise(() => {}));
    renderApp();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders the game board after data loads', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    
    renderApp();

    await waitFor(() => {
        expect(screen.getByText('Je')).toBeInTheDocument();
        expect(screen.getByText('parler')).toBeInTheDocument();
    });

    expect(screen.getByText('parl')).toBeInTheDocument();
    expect(screen.getByText('e')).toBeInTheDocument();
    expect(screen.getByText('es')).toBeInTheDocument();
  });

  it('allows selecting a piece and validates incorrectly', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    renderApp();

    await waitFor(() => screen.getByText('parl'));

    const wrongEnding = screen.getByRole('button', { name: 'es' });
    fireEvent.click(wrongEnding);

    const correctStem = screen.getByRole('button', { name: 'parl' });
    fireEvent.click(correctStem);

    const checkBtn = screen.getByText(/Check/i);
    expect(checkBtn.closest('button')).not.toBeDisabled();
    
    fireEvent.click(checkBtn);

    await waitFor(() => {
        expect(screen.getByText(/Try again/i)).toBeInTheDocument(); 
    });
  });

  it('handles successful completion flow', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    renderApp();

    await waitFor(() => screen.getByText('parl'));

    fireEvent.click(screen.getByRole('button', { name: 'parl' }));
    fireEvent.click(screen.getByRole('button', { name: 'e' }));

    fireEvent.click(screen.getByText(/Check/i));

    await waitFor(() => {
        expect(screen.getByText(/Correct/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Next/i)).toBeInTheDocument();
  });
});