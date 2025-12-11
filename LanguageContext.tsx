import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, TRANSLATIONS } from './locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.fr.ui) => string;
  tTense: (key: string) => string;
  tRule: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr'); // Default to French

  const t = (key: keyof typeof TRANSLATIONS.fr.ui): string => {
    return TRANSLATIONS[language].ui[key] || TRANSLATIONS['fr'].ui[key];
  };

  const tTense = (tenseId: string): string => {
    // @ts-ignore
    return TRANSLATIONS[language].tenses[tenseId] || tenseId;
  };

  const tRule = (tenseId: string): string => {
    // @ts-ignore
    return TRANSLATIONS[language].rules[tenseId] || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tTense, tRule }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};