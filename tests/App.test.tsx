
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { LanguageProvider } from '../LanguageContext';
import { PuzzleData } from '../types';

// --- 1. MOCK SERVICES ---
vi.mock('../services/supabase', () => ({
  fetchRandomPuzzleFromDB: vi.fn(),
}));

import { fetchRandomPuzzleFromDB } from '../services/supabase';

// --- 2. TEST DATA ---
const mockPuzzle: PuzzleData = {
  id: 'test-id',
  verb: 'manger',
  tense: 'Présent',
  person: 'Je',
  pronoun: 'Je',
  translation: 'To eat',
  is_regular: true,
  correctStem: 'Mang',
  correctEnding: 'e',
  distractorStems: ['Fin'],
  distractorEndings: ['es', 'ons'],
  auxStem: null,
  auxEnding: null,
  auxDistractorStems: [],
  auxDistractorEndings: [],
  explanation: 'Test Explanation',
  ruleSummary: 'Base + e',
};

const simulateDragDrop = (dragSource: HTMLElement, dropTarget: HTMLElement, puzzleType: string, text: string) => {
  const dataTransfer = {
    setData: vi.fn(),
    getData: vi.fn((format) => {
      if (format === 'text/plain') return text;
      if (format === 'application/x-puzzle-type') return puzzleType;
      return '';
    }),
    effectAllowed: 'copy',
    dropEffect: 'copy',
  };
  fireEvent.dragStart(dragSource, { dataTransfer });
  fireEvent.dragEnter(dropTarget, { dataTransfer });
  fireEvent.dragOver(dropTarget, { dataTransfer });
  fireEvent.drop(dropTarget, { dataTransfer });
};

describe('App Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 模拟 window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // 模拟 ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
  });

  it('renders loading state initially', () => {
    (fetchRandomPuzzleFromDB as any).mockResolvedValue(new Promise(() => {}));
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('completes a simple tense puzzle successfully', async () => {
    (fetchRandomPuzzleFromDB as any).mockResolvedValue(mockPuzzle);

    await act(async () => {
      render(
        <LanguageProvider >
          <App />
        </LanguageProvider>
      );
    });

    // 找到碎片和放置区
    const stemPiece = screen.getByRole('button', { name: 'Mang' });
    const endingPiece = screen.getByRole('button', { name: 'e' });
    
    // 根据 placeholder 找到放置区
    const stemZone = screen.getByText('Base').closest('div');
    const endingZone = screen.getByText('Fin').closest('div');

    expect(stemZone).not.toBeNull();
    expect(endingZone).not.toBeNull();

    // 模拟拖拽拼装
    await act(async () => {
        simulateDragDrop(stemPiece, stemZone!, 'stem', 'Mang');
        simulateDragDrop(endingPiece, endingZone!, 'ending', 'e');
    });

    // 点击检查
    const checkButton = screen.getByRole('button', { name: /Vérifier/i });
    fireEvent.click(checkButton);

    // 验证成功反馈
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });
});
