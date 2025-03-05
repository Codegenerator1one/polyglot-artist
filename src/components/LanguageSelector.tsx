
import React from 'react';
import { supportedLanguages, Language } from '../utils/supportedLanguages';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelectLanguage 
}) => {
  return (
    <div className="w-full animate-slide-up">
      <div className="section-title mb-3">Select Language</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {supportedLanguages.map((language) => (
          <button
            key={language.id}
            className={cn(
              "p-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
              "hover:bg-accent/70 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "flex items-center justify-center border",
              selectedLanguage.id === language.id
                ? "border-primary/30 bg-accent shadow-sm"
                : "border-transparent bg-accent/40"
            )}
            onClick={() => onSelectLanguage(language)}
          >
            <span 
              className="w-2 h-2 rounded-full mr-1.5" 
              style={{ backgroundColor: language.color }}
            />
            {language.name}
            {language.previewSupported && (
              <span className="ml-1.5 text-xs bg-green-500/20 text-green-600 px-1 py-0.5 rounded">
                Preview
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
