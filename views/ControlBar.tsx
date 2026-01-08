import React from 'react';
import { RefreshCw, Search, ArrowRight } from 'lucide-react';
import { GameState } from '../types';
import { useLanguage } from '../LanguageContext';

interface ControlBarProps {
  gameState: GameState;
  isCheckDisabled: boolean;
  onCheck: () => void;
  onSkip: () => void;
  onNext: () => void;
  // Ref for tutorial
  footerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  gameState,
  isCheckDisabled,
  onCheck,
  onSkip,
  onNext,
  footerRef
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-3 md:py-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-none z-40 flex flex-col items-center justify-center sm:static sm:bg-transparent sm:border-0 sm:backdrop-blur-none w-full">
      <div ref={footerRef} className="flex gap-3 sm:gap-4 w-full justify-center max-w-lg mx-auto px-1">
          {gameState === GameState.SUCCESS ? (
             <button 
             onClick={onNext}
             className="w-full flex items-center justify-center gap-2 bg-french-dark text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold border-2 border-gray-900 shadow-sm hover:bg-gray-800 transition-all active:scale-95 ring-4 ring-gray-100"
           >
             <span>{t('next')}</span>
             <ArrowRight className="w-5 h-5" />
           </button>
          ) : (
            <>
               <button 
                onClick={onSkip}
                className="flex-1 flex items-center justify-center gap-2 text-gray-600 px-4 py-3 sm:px-6 rounded-xl font-bold transition-all border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{t('skip')}</span>
              </button>
              <button 
                onClick={onCheck}
                disabled={isCheckDisabled}
                className={`flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all border-2 ${
                    !isCheckDisabled 
                  ? 'bg-green-600 text-white border-green-700 shadow-sm hover:bg-green-700 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>{t('check')}</span>
              </button>
            </>
          )}
      </div>
    </div>
  );
};
