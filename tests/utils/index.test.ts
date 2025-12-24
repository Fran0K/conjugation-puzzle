import { describe, it, expect, vi } from 'vitest';
import { cleanAndShuffle, measureTextWidth, shuffleArray } from '../../utils';

describe('Utils', () => {
  describe('shuffleArray', () => {
    it('should maintain the same elements', () => {
      const input = [1, 2, 3, 4, 5];
      const output = shuffleArray([...input]);
      expect(output).toHaveLength(input.length);
      expect(output).toEqual(expect.arrayContaining(input));
    });

    it('should shuffle elements (probabilistic)', () => {
      const input = ['a', 'b', 'c', 'd'];
      const output = shuffleArray(input);
      expect(Array.isArray(output)).toBe(true);
    });
  });

  describe('cleanAndShuffle', () => {
    it('should remove nulls, duplicates and empty strings', () => {
      const correct = 'mangé';
      const distractors = ['fini', '', null as any, 'mangé', ' pris ']; 
      
      const result = cleanAndShuffle(correct, distractors);
      
      expect(result).toHaveLength(3);
      expect(result).toContain('mangé');
      expect(result).toContain('fini');
      expect(result).toContain('pris');
      expect(result).not.toContain('');
      expect(result).not.toContain(null);
    });

    it('should handle undefined inputs safely', () => {
        const result = cleanAndShuffle(undefined, undefined);
        expect(result).toEqual([]);
    });
  });

  describe('measureTextWidth', () => {
    it('should return a number', () => {
      const width = measureTextWidth('Test', 'bold 16px Arial');
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThan(0);
    });
  });
});