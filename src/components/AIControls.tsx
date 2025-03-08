
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AIControlsProps {
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
}

const AIControls: React.FC<AIControlsProps> = ({ isGenerating, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description of the code you want to generate.",
        variant: "destructive",
      });
      return;
    }
    
    onGenerate(prompt);
  };

  const suggestionPrompts = [
    "Create a responsive navbar with a logo, links, and a mobile menu",
    "Generate a Python function to calculate the Fibonacci sequence",
    "Create a Java class for a simple banking system",
    "Write a Flutter widget for a custom card component"
  ];

  return (
    <div className="w-full space-y-4 animate-slide-up">
      <div className="section-title text-white/70 flex items-center">
        <Zap className="w-4 h-4 mr-2 text-white/80" /> Describe What You Want
      </div>
      
      <div className="gradient-border">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the code you want to generate..."
          className="min-h-[120px] resize-none bg-black/30 border-none text-white/90 focus:border-white/30 transition-all duration-200 placeholder:text-white/40 rounded-md"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="relative overflow-hidden group bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg border border-white/10"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer group-hover:animate-shimmer"></span>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Code
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setPrompt('')}
          disabled={isGenerating || !prompt.trim()}
          className="border-white/10 bg-black/20 hover:bg-white/10 transition-all duration-200 text-white/80"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-white/60">Suggestions</div>
        <div className="flex flex-wrap gap-2">
          {suggestionPrompts.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion)}
              className="text-xs px-3 py-1.5 bg-white/5 backdrop-blur-sm text-white/80 rounded-full hover:bg-white/10 transition-all duration-200 border border-white/10 flex items-center group animate-fade-in"
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-white/70 group-hover:text-white/90 transition-colors" />
              {suggestion.length > 40 ? suggestion.substring(0, 40) + "..." : suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIControls;
