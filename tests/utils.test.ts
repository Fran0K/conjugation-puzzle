
import { describe, it, expect } from 'vitest';
import { shuffleArray, cleanAndShuffle } from '../App';


describe('App Utils Logic', () => {
  describe('shuffleArray', () => {
    it('should maintain the same elements after shuffling', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      expect(result).toHaveLength(input.length);
      expect(new Set(result)).toEqual(new Set(input));
    });

    it('should return a new array instance', () => {
      const input = [1, 2];
      const result = shuffleArray(input);
      expect(result).not.toBe(input);
    });
  });

  describe('cleanAndShuffle', () => {
    it('should deduplicate elements', () => {
      const correct = 'mang';
      const distractors = ['mang', 'fin', 'aim'];
      const result = cleanAndShuffle(correct, distractors);
      expect(result).toHaveLength(3);
      expect(result).toContain('mang');
      expect(result).toContain('fin');
      expect(result).toContain('aim');
    });

    it('should filter out null or empty strings', () => {
      const correct = 'mang';
      const distractors = ['', ' ', null as any, 'fin'];
      const result = cleanAndShuffle(correct, distractors);
      expect(result).toHaveLength(2);
      expect(result).toContain('mang');
      expect(result).toContain('fin');
    });
  });
});
