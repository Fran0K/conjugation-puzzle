
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabasePuzzle, PuzzleData } from '../types';

// Use Vite environment variables
// Cast import.meta to any to avoid TypeScript errors if types are missing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Please check your .env file.");
}

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Mapper: Extracts the correct language from JSONB columns
 */
export const mapDatabasePuzzleToUI = (dbPuzzle: DatabasePuzzle, languageCode: string): PuzzleData => {
  // 1. Extract Verb Translation
  // Default to English if specific language is missing
  const verbTranslations = dbPuzzle.verbs?.translations || {};
  const verbTrans = verbTranslations[languageCode] || verbTranslations['en'] || dbPuzzle.verbs?.infinitive || '';

  // 2. Extract Explanation Translation
  const explanationTranslations = dbPuzzle.explanation_translations || {};
  const explanation = explanationTranslations[languageCode] || explanationTranslations['en'] || "No explanation available.";

  return {
    id: dbPuzzle.id,
    verb: dbPuzzle.verbs?.infinitive || 'Unknown',
    tense: dbPuzzle.tense,
    person: dbPuzzle.person,
    pronoun: dbPuzzle.pronoun || dbPuzzle.person, // Fallback to person if pronoun is empty (safety)
    translation: verbTrans,
    is_regular: dbPuzzle.is_regular, 
    
    correctStem: dbPuzzle.correct_stem,
    correctEnding: dbPuzzle.correct_ending || null, // Ensure it is null if empty
    distractorStems: dbPuzzle.distractor_stems,
    distractorEndings: dbPuzzle.distractor_endings || [],

    auxStem: dbPuzzle.aux_stem,
    auxEnding: dbPuzzle.aux_ending,
    auxDistractorStems: dbPuzzle.distractor_aux_stems || [],
    auxDistractorEndings: dbPuzzle.distractor_aux_endings || [],

    explanation: explanation,
    ruleSummary: dbPuzzle.rule_summary 
  };
};

export const fetchRandomPuzzleFromDB = async (allowedTenses?: string[], languageCode: string = 'en'): Promise<PuzzleData | null> => {
  if (!supabase) {
    console.warn("Supabase client is not initialized.");
    return null;
  }

  try {
    // Step 1: Get Random Verb ID
    const { data: verbs, error: verbError } = await supabase
      .from('verbs')
      .select('id');

    if (verbError) {
      console.error('Error fetching verbs:', JSON.stringify(verbError, null, 2));
      return null;
    }
    
    if (!verbs || verbs.length === 0) {
      console.warn('Database is empty: No verbs found.');
      return null;
    }

    const randomVerbIndex = Math.floor(Math.random() * verbs.length);
    const randomVerbId = verbs[randomVerbIndex].id;

    // Step 2: Fetch Puzzles + Verb Info (No complex joins for translations needed!)
    let query = supabase
      .from('puzzles')
      .select(`
        *,
        verbs (
          infinitive,
          translations
        )
      `)
      .eq('verb_id', randomVerbId);
    
    if (allowedTenses && allowedTenses.length > 0) {
      query = query.in('tense', allowedTenses);
    }

    const { data: puzzles, error: puzzleError } = await query;

    if (puzzleError) {
      console.error('Error fetching puzzles:', JSON.stringify(puzzleError, null, 2));
      return null;
    }

    if (!puzzles || puzzles.length === 0) {
      return null;
    }

    // Step 3: Pick random puzzle and Map
    const randomPuzzleIndex = Math.floor(Math.random() * puzzles.length);
    return mapDatabasePuzzleToUI(puzzles[randomPuzzleIndex] as any, languageCode);

  } catch (err) {
    console.error("Unexpected error in fetchRandomPuzzleFromDB:", err);
    return null;
  }
};