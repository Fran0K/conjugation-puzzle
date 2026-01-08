import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchPuzzleBatch } from '../services/supabase';
import { PuzzleData, GameState } from '../types';
import { Language } from '../locales';

// Configuration for the puzzle queue
const INITIAL_BATCH_SIZE = 5;
const REFILL_THRESHOLD = 2;
const REFILL_BATCH_SIZE = 3;

export const usePuzzleEngine = (
  language: Language,
  selectedTenses: string[]
) => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  
  // Internal Queue State
  const puzzleQueue = useRef<PuzzleData[]>([]);
  const isFetchingRef = useRef(false);

  // Background fetch to keep the queue populated
  const fetchMore = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const newPuzzles = await fetchPuzzleBatch(REFILL_BATCH_SIZE, selectedTenses, language);
      puzzleQueue.current = [...puzzleQueue.current, ...newPuzzles];
    } catch (e) {
      console.error("Bg fetch failed", e);
    } finally {
      isFetchingRef.current = false;
    }
  }, [language, selectedTenses]);

  // Core function to rotate to the next puzzle
  const loadNextPuzzle = useCallback(async () => {
    // 1. Try to pop from Queue
    if (puzzleQueue.current.length > 0) {
      const next = puzzleQueue.current.shift()!;
      setPuzzle(next);
      setGameState(GameState.PLAYING); // Reset state to PLAYING

      // Trigger background refill if needed
      if (puzzleQueue.current.length <= REFILL_THRESHOLD) {
        fetchMore();
      }
      return;
    }

    // 2. Queue is Empty (Cold Start or Network Lag) -> Fetch Directly
    setGameState(GameState.LOADING);
    setPuzzle(null);
    
    try {
      const newPuzzles = await fetchPuzzleBatch(INITIAL_BATCH_SIZE, selectedTenses, language);
      if (newPuzzles && newPuzzles.length > 0) {
        puzzleQueue.current = newPuzzles;
        const first = puzzleQueue.current.shift()!;
        setPuzzle(first);
        setGameState(GameState.PLAYING);
      } else {
        setGameState(GameState.ERROR);
      }
    } catch (e) {
      console.error(e);
      setGameState(GameState.ERROR);
    }
  }, [fetchMore, language, selectedTenses]);

  // Initial Load / Reset when dependencies (Language/Tenses) change
  useEffect(() => {
    // Flush queue to ensure we don't show stale puzzles (e.g. wrong language)
    puzzleQueue.current = [];
    loadNextPuzzle();
  }, [language, selectedTenses, loadNextPuzzle]);

  return {
    puzzle,
    gameState,
    setGameState, // Expose setter so the Game Logic can set SUCCESS state
    loadNextPuzzle
  };
};