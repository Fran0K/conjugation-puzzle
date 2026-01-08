import { useState, useEffect, useMemo } from 'react';
import { PuzzleData, ValidationState } from '../types';
import { cleanAndShuffle } from '../utils';

export const useGameplay = (
  puzzle: PuzzleData | null,
  t: (key: string) => string, // translation function
  onSuccess: () => void // callback when puzzle is solved
) => {
  // --- Available Pieces State ---
  const [availableStems, setAvailableStems] = useState<string[]>([]);
  const [availableEndings, setAvailableEndings] = useState<string[]>([]);
  const [availableAuxStems, setAvailableAuxStems] = useState<string[]>([]);
  const [availableAuxEndings, setAvailableAuxEndings] = useState<string[]>([]);

  // --- User Selection State ---
  const [selectedStem, setSelectedStem] = useState<string | null>(null);
  const [selectedEnding, setSelectedEnding] = useState<string | null>(null);
  const [selectedAuxStem, setSelectedAuxStem] = useState<string | null>(null);
  const [selectedAuxEnding, setSelectedAuxEnding] = useState<string | null>(null);

  // --- UI/Validation State ---
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<ValidationState | null>(null);

  // --- 1. Reset & Shuffle when puzzle changes ---
  useEffect(() => {
    if (puzzle) {
      // Reset UI
      setFeedback(null);
      setValidationState(null);
      setSelectedStem(null);
      setSelectedEnding(null);
      setSelectedAuxStem(null);
      setSelectedAuxEnding(null);
      setShowHint(false);

      // Prepare Trays (Shuffle Logic)
      setAvailableStems(cleanAndShuffle(puzzle.correctStem, puzzle.distractorStems));
      
      if (puzzle.correctEnding !== null) {
         setAvailableEndings(cleanAndShuffle(puzzle.correctEnding, puzzle.distractorEndings));
      } else {
         setAvailableEndings([]);
      }
  
      if (puzzle.auxStem) {
        setAvailableAuxStems(cleanAndShuffle(puzzle.auxStem, puzzle.auxDistractorStems));
        if (puzzle.auxEnding !== null) {
          setAvailableAuxEndings(cleanAndShuffle(puzzle.auxEnding, puzzle.auxDistractorEndings));
        } else {
          setAvailableAuxEndings([]);
        }
      } else {
        setAvailableAuxStems([]);
        setAvailableAuxEndings([]);
      }
    }
  }, [puzzle]);

  // --- 2. Interaction Handlers ---

  const clearValidation = () => {
    setValidationState(null);
    // Only clear feedback if it was a "Wrong" message. Keep "Correct" visible until next puzzle.
    if (feedback && feedback !== t('correct')) setFeedback(null);
  };

  const handleSelectStem = (item: string) => {
    setSelectedStem(prev => prev === item ? null : item);
    clearValidation();
  };

  const handleSelectEnding = (item: string) => {
    setSelectedEnding(prev => prev === item ? null : item);
    clearValidation();
  };

  const handleSelectAuxStem = (item: string) => {
    setSelectedAuxStem(prev => prev === item ? null : item);
    clearValidation();
  };

  const handleSelectAuxEnding = (item: string) => {
    setSelectedAuxEnding(prev => prev === item ? null : item);
    clearValidation();
  };

  // --- 3. Check Logic ---
  const checkAnswer = () => {
    if (!puzzle) return;
    
    // Calculate individual correctness
    const isStemCorrect = selectedStem === puzzle.correctStem;
    const isEndingCorrect = puzzle.correctEnding !== null ? (selectedEnding === puzzle.correctEnding) : true;
    
    let isAuxStemCorrect = true;
    let isAuxEndingCorrect = true;

    if (puzzle.auxStem) {
        isAuxStemCorrect = selectedAuxStem === puzzle.auxStem;
        isAuxEndingCorrect = puzzle.auxEnding !== null ? selectedAuxEnding === puzzle.auxEnding : true;
    }

    // Set Partial Validation State (for UI coloring)
    setValidationState({
        stem: isStemCorrect,
        ending: puzzle.correctEnding !== null ? isEndingCorrect : undefined,
        auxStem: puzzle.auxStem ? isAuxStemCorrect : undefined,
        auxEnding: (puzzle.auxStem && puzzle.auxEnding !== null) ? isAuxEndingCorrect : undefined
    });

    const isAllCorrect = isStemCorrect && isEndingCorrect && isAuxStemCorrect && isAuxEndingCorrect;

    if (isAllCorrect) {
      // @ts-ignore
      setFeedback(t('correct'));
      onSuccess(); // Delegate side effects (scoring, gamestate change) to parent
    } else {
      // @ts-ignore
      setFeedback(t('wrong'));
      // Auto-hide negative feedback
      setTimeout(() => {
          // @ts-ignore
          setFeedback((current) => current === t('wrong') ? null : current);
      }, 3000);
    }
  };

  // --- 4. Completion Status ---
  const isCompound = !!puzzle?.auxStem;
  let isComplete = false;
  if (puzzle) {
    if (isCompound) {
      const auxEndingNeeded = puzzle.auxEnding !== null;
      const auxComplete = auxEndingNeeded ? (!!selectedAuxStem && !!selectedAuxEnding) : !!selectedAuxStem;
      const mainEndingNeeded = puzzle.correctEnding !== null;
      const mainComplete = mainEndingNeeded ? (!!selectedStem && !!selectedEnding) : !!selectedStem;
      isComplete = auxComplete && mainComplete;
    } else {
       if (puzzle.correctEnding !== null) {
          isComplete = !!selectedStem && !!selectedEnding;
       } else {
          isComplete = !!selectedStem;
       }
    }
  }

  return {
    pieces: {
      stems: availableStems,
      endings: availableEndings,
      auxStems: availableAuxStems,
      auxEndings: availableAuxEndings
    },
    selection: {
      stem: selectedStem,
      ending: selectedEnding,
      auxStem: selectedAuxStem,
      auxEnding: selectedAuxEnding
    },
    validation: {
      state: validationState,
      feedback: feedback
    },
    ui: {
      showHint,
      toggleHint: () => setShowHint(p => !p),
      isComplete
    },
    actions: {
      selectStem: handleSelectStem,
      selectEnding: handleSelectEnding,
      selectAuxStem: handleSelectAuxStem,
      selectAuxEnding: handleSelectAuxEnding,
      check: checkAnswer,
      clearValidation // Exposed for direct drop handling if needed
    }
  };
};
