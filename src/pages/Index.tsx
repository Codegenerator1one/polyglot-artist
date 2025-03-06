
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import AIControls from '@/components/AIControls';
import SaveProjectDialog from '@/components/SaveProjectDialog';
import { supportedLanguages, getLanguageById } from '@/utils/supportedLanguages';
import { generateCode } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@clerk/clerk-react';

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguageById('html'));
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isSignedIn } = useAuth();
  const { toast } = useToast();

  // Check if we're coming from the "Edit Project" action
  useEffect(() => {
    const savedCode = localStorage.getItem('editing_project_code');
    const savedLanguage = localStorage.getItem('editing_project_language');
    
    if (savedCode && savedLanguage) {
      setCode(savedCode);
      try {
        setSelectedLanguage(getLanguageById(savedLanguage));
      } catch (e) {
        console.error("Language not found:", savedLanguage);
      }
      
      // Clear the temporary storage
      localStorage.removeItem('editing_project_code');
      localStorage.removeItem('editing_project_language');
      
      toast({
        title: "Project Loaded",
        description: "Your project has been loaded for editing.",
      });
    }
  }, [toast]);

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4 space-y-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight animate-fade-in">AI Code Generator</h2>
              <p className="text-muted-foreground animate-fade-in delay-100">
                Generate code in multiple languages powered by Google Gemini AI
              </p>
            </div>
            
            {isSignedIn && (
              <SaveProjectDialog 
                currentLanguage={selectedLanguage.id}
                currentCode={code}
              />
            )}
          </div>
          
          <Separator className="my-6" />
          
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageSelect}
          />
          
          <AIControls 
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="section-title">Code</div>
              <CodeEditor 
                code={code}
                language={selectedLanguage}
                onCodeChange={handleCodeChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="section-title">Preview</div>
              <PreviewPanel 
                code={code}
                language={selectedLanguage}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border/50 py-4 text-center text-sm text-muted-foreground">
        <p>Powered by Google Gemini 2.0 Flash API</p>
      </footer>
    </div>
  );
};

export default Index;
