
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AIModel, supportedAIModels } from '../services/aiService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

interface AIControlsProps {
  isGenerating: boolean;
  onGenerate: (prompt: string, model: string, temperature: number, maxLength: number) => void;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
}

const AIControls: React.FC<AIControlsProps> = ({ 
  isGenerating, 
  onGenerate, 
  selectedModel,
  setSelectedModel 
}) => {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.2); // 0-1, lower = more deterministic
  const [maxLength, setMaxLength] = useState(8192); // max tokens/length
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
    
    onGenerate(prompt, selectedModel.id, temperature, maxLength);
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
        placeholder="Describe the code you want to generate in detail..."
        className="min-h-[100px] resize-none bg-background border-border/50 focus:border-primary/30 transition-all duration-200"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/50 hover:bg-accent/50 transition-all duration-200">
                {selectedModel.name} <span className="text-xs opacity-60 ml-1">↓</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>AI Models</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {supportedAIModels.map((model) => (
                <DropdownMenuItem 
                  key={model.id} 
                  onClick={() => setSelectedModel(model)}
                  className={selectedModel.id === model.id ? "bg-accent/50" : ""}
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-border/50 hover:bg-accent/50 transition-all duration-200"
          >
            <Sliders className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setPrompt('')}
          disabled={isGenerating || !prompt.trim()}
          className="border-border/50 hover:bg-accent/50 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {showAdvanced && (
        <div className="bg-accent/20 p-4 rounded-md border border-border/30 space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Temperature: {temperature.toFixed(1)}</label>
              <span className="text-xs text-muted-foreground">
                {temperature < 0.3 ? 'More precise' : temperature > 0.7 ? 'More creative' : 'Balanced'}
              </span>
            </div>
            <Slider
              value={[temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(vals) => setTemperature(vals[0])}
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Maximum Length: {maxLength}</label>
            </div>
            <Slider
              value={[maxLength]}
              min={1024}
              max={16384}
              step={1024}
              onValueChange={(vals) => setMaxLength(vals[0])}
              disabled={isGenerating}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Shorter</span>
              <span className="text-xs text-muted-foreground">Longer</span>
            </div>
          </div>
        </div>
      )}
      
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
