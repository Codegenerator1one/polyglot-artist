
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, RefreshCw, Sparkles } from 'lucide-react';
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
    <div className="w-full space-y-4 animate-scale-in">
      <div className="section-title">Describe What You Want</div>
      
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the code you want to generate..."
        className="min-h-[100px] resize-none bg-background border-border/50 focus:border-primary/30 transition-all duration-200"
      />
      
      <div className="flex justify-between items-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
        >
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
          className="border-border/50 hover:bg-accent/50 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Suggestions</div>
        <div className="flex flex-wrap gap-2">
          {suggestionPrompts.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion)}
              className="text-xs px-3 py-1.5 bg-accent/50 text-accent-foreground rounded-full hover:bg-accent transition-all duration-200 border border-border/40 flex items-center"
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-primary/70" />
              {suggestion.length > 40 ? suggestion.substring(0, 40) + "..." : suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIControls;
