
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import AIControls from '@/components/AIControls';
import { supportedLanguages, getLanguageById } from '@/utils/supportedLanguages';
import { generateCode } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguageById('html'));
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleLanguageSelect = (language: typeof selectedLanguage) => {
    setSelectedLanguage(language);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const result = await generateCode({
        language: selectedLanguage.name,
        prompt: prompt
      });
      
      if (result.error) {
        toast({
          title: "Generation Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setCode(result.code);
        toast({
          title: "Code Generated",
          description: `${selectedLanguage.name} code has been generated successfully.`,
          className: "bg-black/80 text-white border border-white/10",
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 space-y-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="space-y-2 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight gradient-text">
              AI Code Generator
            </h2>
            <p className="text-lg text-white/70 animate-fade-in animate-delay-100">
              Generate code in multiple languages powered by Google Gemini AI
            </p>
          </div>
          
          <Separator className="my-6 bg-white/10" />
          
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageSelect}
          />
          
          <AIControls 
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in animate-delay-300">
            <div className="space-y-3">
              <div className="section-title text-white/70">Code Editor</div>
              <div className="gradient-border animate-shimmer">
                <CodeEditor 
                  code={code}
                  language={selectedLanguage}
                  onCodeChange={handleCodeChange}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="section-title text-white/70">Live Preview</div>
              <div className="gradient-border animate-shimmer">
                <PreviewPanel 
                  code={code}
                  language={selectedLanguage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-white/10 py-5 text-center text-sm text-white/60 backdrop-blur-sm">
        <p className="animate-fade-in">Powered by Google Gemini 2.0 Flash API</p>
      </footer>
    </div>
  );
};

export default Index;
