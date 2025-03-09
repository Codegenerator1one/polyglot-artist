
import React from 'react';
import { Code, Github } from 'lucide-react';
import { Link } from './ui/link';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-white/10 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 py-5 px-6 flex items-center justify-between animate-fade-in backdrop-blur-xl shadow-md">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-70 animate-pulse"></div>
          <Code className="w-7 h-7 text-white relative" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-100">
          CodeGenius
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium text-white">Powered by Gemini</span>
        </div>
        
        <Link 
          href="https://github.com" 
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 group"
          underline={false}
        >
          <Github className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
