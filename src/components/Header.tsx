
import React from 'react';
import { Code, Github } from 'lucide-react';
import { Link } from './ui/link';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-white/10 bg-black/5 backdrop-blur-xl py-5 px-6 flex items-center justify-between animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-black rounded-full blur-md opacity-50 animate-pulse"></div>
          <Code className="w-7 h-7 text-white relative" />
        </div>
        <h1 className="text-2xl font-bold gradient-text tracking-tight">CodeGenius</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium text-white/80">Powered by Gemini</span>
        </div>
        
        <Link 
          href="https://github.com" 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group"
          underline={false}
        >
          <Github className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
