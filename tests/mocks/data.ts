import { PuzzleData } from '../../types';

export const mockPuzzleData: PuzzleData = {
  id: 'test-1',
  verb: 'parler',
  tense: 'Présent',
  person: 'Je',
  pronoun: 'Je',
  translation: 'to speak',
  is_regular: true,
  correctStem: 'parl',
  correctEnding: 'e',
  distractorStems: ['fin'],
  distractorEndings: ['es', 'ons'],
  auxStem: null,
  auxEnding: null,
  auxDistractorStems: [],
  auxDistractorEndings: [],
  explanation: 'Test Explanation',
  ruleSummary: 'Rule Summary'
};

