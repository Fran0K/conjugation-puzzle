import React, { useMemo } from 'react';
import { TrayConfig, SlotType, PuzzleData } from '../types';
import { TrayGroup } from '../components/TrayGroup';
import { useLanguage } from '../LanguageContext';

interface SupplyLayoutProps {
  puzzle: PuzzleData;
  pieces: {
    stems: string[];
    endings: string[];
    auxStems: string[];
    auxEndings: string[];
  };
  selection: {
    stem: string | null;
    ending: string | null;
    auxStem: string | null;
    auxEnding: string | null;
  };
  actions: {
    selectStem: (s: string) => void;
    selectEnding: (s: string) => void;
    selectAuxStem: (s: string) => void;
    selectAuxEnding: (s: string) => void;
  };
  // Ref for tutorial
  trayRef?: React.RefObject<HTMLDivElement | null>;
}

export const SupplyLayout: React.FC<SupplyLayoutProps> = ({
  puzzle,
  pieces,
  selection,
  actions,
  trayRef
}) => {
  const { t } = useLanguage();

  const showAuxConnectors = puzzle ? (puzzle.auxEnding !== null) : false;
  const showVerbConnectors = puzzle ? (puzzle.correctEnding !== null) : false;

  const hasAuxStem = pieces.auxStems.length > 0;
  const hasAuxEnd = pieces.auxEndings.length > 0;
  const hasVerbStem = pieces.stems.length > 0;
  const hasVerbEnd = pieces.endings.length > 0;

  // --- TRAY CONFIGURATION ---
  // Re-implemented from App.tsx to keep logic close to UI
  const auxTrays: TrayConfig[] = useMemo(() => {
    const trays = [];
    if (hasAuxStem) {
      trays.push({
        id: 'aux-stem',
        items: pieces.auxStems,
        type: 'aux-stem' as SlotType,
        selected: selection.auxStem,
        onSelect: actions.selectAuxStem,
        title: hasAuxEnd ? t('lbl_aux_stem') : t('lbl_aux'),
        color: 'amber' as const,
        showConnectors: showAuxConnectors
      });
    }
    if (hasAuxEnd) {
      trays.push({
        id: 'aux-ending',
        items: pieces.auxEndings,
        type: 'aux-ending' as SlotType,
        selected: selection.auxEnding,
        onSelect: actions.selectAuxEnding,
        title: t('lbl_aux_ending'),
        color: 'amber' as const
      });
    }
    return trays;
  }, [hasAuxStem, hasAuxEnd, pieces, selection, actions, showAuxConnectors, t]);

  const verbTrays: TrayConfig[] = useMemo(() => {
    const trays = [];
    if (hasVerbStem) {
      trays.push({
        id: 'stem',
        items: pieces.stems,
        type: 'stem' as SlotType,
        selected: selection.stem,
        onSelect: actions.selectStem,
        title: hasVerbEnd ? t('lbl_verb_stem') : t('lbl_verb'),
        color: 'blue' as const,
        showConnectors: showVerbConnectors
      });
    }
    if (hasVerbEnd) {
      trays.push({
        id: 'ending',
        items: pieces.endings,
        type: 'ending' as SlotType,
        selected: selection.ending,
        onSelect: actions.selectEnding,
        title: t('lbl_verb_ending'),
        color: 'blue' as const
      });
    }
    return trays;
  }, [hasVerbStem, hasVerbEnd, pieces, selection, actions, showVerbConnectors, t]);

  const allTrays = [...auxTrays, ...verbTrays];

  if (allTrays.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mt-0 mb-6 sm:mb-10" ref={trayRef}>
      <TrayGroup trays={allTrays} />
    </div>
  );
};
