
import React from 'react';
import { X, Heart, Github, Linkedin, Rss } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-display font-bold text-french-dark">
            {t('about')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center text-center">
           {/* Logo / Icon */}
           <div className="w-20 h-20 bg-french-blue rounded-2xl flex items-center justify-center text-white font-bold font-display text-5xl shadow-lg mb-6 transform rotate-3">
              C
           </div>

           <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('title')}</h1>
           <p className="text-xs font-mono text-gray-400 mb-6">{t('version')}</p>

           <p className="text-gray-600 leading-relaxed mb-8">
             {t('about_desc')}
           </p>

           <div className="w-full border-t border-gray-100 pt-6">
             <p className="text-sm text-gray-500 mb-2 font-semibold flex items-center justify-center gap-1">
               {t('author')} <Heart className="w-3 h-3 text-red-500 fill-current" />
             </p>
             <p className="text-french-dark font-bold text-lg">
               Frank Lam
             </p>
             <div className="flex justify-center mt-3 gap-4">
                {/* Optional Social Links */}
                <a href="https://github.com/Fran0K/fran0k.github.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.hacomata.buzz/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors">
                  <Rss className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/haochang-lin-a99606223/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
