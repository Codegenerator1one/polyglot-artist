
import React from 'react';
import { Code } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm py-4 px-6 flex items-center justify-between animate-fade-in">
      <div className="flex items-center space-x-2">
        <Code className="w-6 h-6 text-primary animate-pulse-subtle" />
        <h1 className="text-xl font-medium">CodeGenius</h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full">
          Powered by Gemini
        </div>
      </div>
    </header>
  );
};

export default Header;
