
import React, { useState } from 'react';
import { GRAMMAR_RULES } from '../constants';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface GrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarModal: React.FC<GrammarModalProps> = ({ isOpen, onClose }) => {
  const { t, tTense, tRule } = useLanguage();
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setExpandedRuleId(prev => prev === id ? null : id);
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-display font-bold text-french-dark">
            {t('rules')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
          {/* <p className="text-gray-600">
            Logique des temps / Tense Logic:
          </p> */}

          <div className="grid gap-4">
            {GRAMMAR_RULES.map((rule) => {
              if (!rule.id) return null;
              const localizedRule = tRule(rule.id);
              const isExpanded = expandedRuleId === rule.id;
              if (!localizedRule) return null;
              return (
                <div 
                  key={rule.id} 
                  className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${rule.color} ${isExpanded ? 'shadow-md scale-[1.01]' : 'shadow-sm hover:shadow-md cursor-pointer'}`}
                  // className={`rounded-xl transition-all duration-300 overflow-hidden `}
                  onClick={() => handleToggle(rule.id)}
                >
                  <div className="p-5">
                    <div className="flex flex-row items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{localizedRule.title || tTense(rule.id)}</h3>
                      <div className={`p-1 rounded-full ${isExpanded ? 'bg-black/10' : 'bg-transparent'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5 opacity-70" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                      </div>
                    </div>
                    
                    <div className="font-mono text-sm bg-white/50 inline-block px-3 py-1 rounded mb-3 font-semibold">
                      {localizedRule.formula}
                    </div>
                    
                    {/* <p className="text-sm mb-3 opacity-90 leading-relaxed">
                      {localizedRule.description}
                    </p> */}
                    
                    {!isExpanded && (
                      <div className="text-sm italic font-medium opacity-75">
                        Ex: {localizedRule.example}
                      </div>
                    )}
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="bg-white/40 border-t border-black/5 p-5 animate-in slide-in-from-top-2 duration-200">
                       <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">{t('Detail')}</h4>
                       {localizedRule.details ? (
                         <div className="space-y-4">
                           {localizedRule.details.map((detail, idx) => (
                             <div key={idx} className="bg-white/60 p-3 rounded-lg border border-white/50">
                               <div className="font-bold text-sm mb-1">{detail.label}</div>
                               <div className="text-sm opacity-90 mb-1">{detail.text}</div>
                               {detail.examples && (
                                 <div className="text-xs italic opacity-75 border-t border-black/5 pt-1 mt-1">
                                   Ex: {detail.examples}
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-sm opacity-80">
                            Exemple détaillé: <span className="font-medium italic">{localizedRule.example}</span>
                            <br/><br/>
                            {localizedRule.description}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 md:py-3 bg-french-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            OK
          </button>
        </div> */}
      </div>
    </div>
  );
};
