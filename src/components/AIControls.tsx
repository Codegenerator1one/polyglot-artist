
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, RefreshCw, Sparkles, Zap, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AIControlsProps {
  isGenerating: boolean;
  onGenerate: (prompt: string, imageData?: string) => void;
}

const AIControls: React.FC<AIControlsProps> = ({ isGenerating, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    onGenerate(prompt, imagePreview || undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create file preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      toast({
        title: "Image attached",
        description: "Your image has been attached to the prompt.",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
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

      {/* Image preview area */}
      {imagePreview && (
        <div className="relative w-full max-w-[200px] h-[100px] overflow-hidden rounded-md border border-white/20">
          <img 
            src={imagePreview} 
            alt="Reference" 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={removeImage}
            className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white/80 hover:text-white"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
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

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            aria-label="Upload reference image"
          />

          {/* Image upload button */}
          <Button
            variant="outline"
            onClick={handleImageButtonClick}
            disabled={isGenerating}
            className="border-white/10 bg-black/20 hover:bg-white/10 transition-all duration-200 text-white/80"
            title="Attach reference image"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        
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
