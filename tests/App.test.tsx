import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { LanguageProvider } from '../LanguageContext';
import * as SupabaseService from '../services/supabase';
import { mockPuzzleData, mockCompoundPuzzleData } from './mocks/data';

// Mock the DB fetch function
vi.mock('../services/supabase', async (importOriginal) => {
  const actual = await importOriginal() as typeof SupabaseService;
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

  it('renders the game board with Simple Tense data', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    
    renderApp();

    await waitFor(() => {
        expect(screen.getByText('Je')).toBeInTheDocument();
        expect(screen.getByText('parler')).toBeInTheDocument();
    });

    // Check availability of pieces (using regex to avoid partial match issues if split)
    // The TrayGroup renders async, so we wait
    await waitFor(() => {
        expect(screen.getByText('parl')).toBeInTheDocument();
        expect(screen.getByText('e')).toBeInTheDocument();
        expect(screen.getByText('es')).toBeInTheDocument();
    });
  });

  it('renders the game board with Compound Tense data (Auxiliary)', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockCompoundPuzzleData);
    
    renderApp();

    await waitFor(() => {
        expect(screen.getByText("Je")).toBeInTheDocument();
        expect(screen.getByText('manger')).toBeInTheDocument();
    });

    // Should see Auxiliary pieces
    // Note: TrayGroup uses ResizeObserver which adds an async delay to rendering.
    // We increase timeout to prevent flakiness in CI/Test environments.
    await waitFor(() => {
        expect(screen.getByText('a')).toBeInTheDocument(); // Aux stem
        expect(screen.getByText('mang')).toBeInTheDocument(); // Participle stem
    }, { timeout: 3000 });
  });

  it('allows selecting a piece and validates incorrectly', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    renderApp();

    // Wait for trays
    await waitFor(() => screen.getByText('parl'));

    // Select wrong ending
    const wrongEnding = screen.getByRole('button', { name: 'es' });
    fireEvent.click(wrongEnding);

    // Select correct stem
    const correctStem = screen.getByRole('button', { name: 'parl' });
    fireEvent.click(correctStem);

    const checkBtn = screen.getByText(/Check/i);
    expect(checkBtn.closest('button')).not.toBeDisabled();
    
    fireEvent.click(checkBtn);

    await waitFor(() => {
        // "Try again" depends on locale, using loose match
        expect(screen.getByText(/Try again|Encore/i)).toBeInTheDocument(); 
    });
  });

  it('handles successful completion flow', async () => {
    (SupabaseService.fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzleData);
    renderApp();

    await waitFor(() => screen.getByText('parl'));

    // Correct sequence
    fireEvent.click(screen.getByRole('button', { name: 'parl' }));
    fireEvent.click(screen.getByRole('button', { name: 'e' }));

    fireEvent.click(screen.getByText(/Check/i));

    await waitFor(() => {
        expect(screen.getByText(/Correct/i)).toBeInTheDocument();
    });

    // Explanation should appear
    expect(screen.getByText('Test Explanation')).toBeInTheDocument();

    // "Next" button appears
    expect(screen.getByText(/Next/i)).toBeInTheDocument();
  });
});