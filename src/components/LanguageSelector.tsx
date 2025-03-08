
import React from 'react';
import { supportedLanguages, Language } from '../utils/supportedLanguages';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelectLanguage 
}) => {
  return (
    <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="section-title mb-3 text-white/70 flex items-center">
        <Code className="w-4 h-4 mr-2 text-white/80" /> Select Language
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {supportedLanguages.map((language, index) => (
          <button
            key={language.id}
            className={cn(
              "p-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20",
              "flex items-center justify-center border backdrop-blur-sm",
              selectedLanguage.id === language.id
                ? "border-white/30 bg-white/10 shadow-lg"
                : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
            onClick={() => onSelectLanguage(language)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full mr-2 transition-transform group-hover:scale-110" 
              style={{ backgroundColor: language.color }}
            />
            <span className="text-white/90">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
