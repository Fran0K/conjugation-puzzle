/**
 * Global Utility Functions
 */

// --- 1. Text Measurement (Singleton Pattern) ---

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedContext: CanvasRenderingContext2D | null = null;

export const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') return 0;
  
  // Lazy initialization: create once, reuse forever
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedContext = sharedCanvas.getContext('2d');
  }

  if (!sharedContext) return 0;

  // Optimization: Only update font property if it changes
  if (sharedContext.font !== font) {
    sharedContext.font = font;
  }
  
  return sharedContext.measureText(text).width;
};

// --- 2. Array Helpers ---

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Deduplicate, filter empty strings, and shuffle
// Used for preparing puzzle trays
export function cleanAndShuffle(correct: string | null | undefined, distractors: string[] | null | undefined): string[] {
  const set = new Set<string>();
  if (correct && correct.trim()) set.add(correct.trim());
  if (distractors) {
    distractors.forEach(d => {
      if (d && d.trim()) set.add(d.trim());
    });
  }
  return shuffleArray(Array.from(set));
}
