
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import AIControls from '@/components/AIControls';
import ModelSelector from '@/components/ModelSelector';
import { supportedLanguages, getLanguageById } from '@/utils/supportedLanguages';
import { generateCode, supportedAIModels } from '@/services/aiService';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguageById('html'));
  const [selectedModel, setSelectedModel] = useState(supportedAIModels[0]); // Default to Gemini
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleLanguageSelect = (language: typeof selectedLanguage) => {
    setSelectedLanguage(language);
  };

  const handleModelSelect = (model: typeof selectedModel) => {
    setSelectedModel(model);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleGenerate = async (prompt: string, model: string, temperature: number, maxLength: number) => {
    setIsGenerating(true);
    
    try {
      const result = await generateCode({
        language: selectedLanguage.name,
        prompt: prompt,
        model: model,
        temperature: temperature,
        maxLength: maxLength
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
          description: `${selectedLanguage.name} code has been generated with ${selectedModel.name}.`,
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
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight animate-fade-in">Advanced AI Code Generator</h2>
            <p className="text-muted-foreground animate-fade-in delay-100">
              Generate code in multiple languages powered by multiple AI models with live preview support
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generate">Generate Code</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate">
              <div className="space-y-6">
                <AIControls 
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
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
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={handleLanguageSelect}
                />
                
                <ModelSelector
                  selectedModel={selectedModel}
                  onSelectModel={handleModelSelect}
                  aiModels={supportedAIModels}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-border/50 py-4 text-center text-sm text-muted-foreground">
        <p>Powered by Google Gemini, OpenAI, Claude and other AI models</p>
      </footer>
    </div>
  );
};

export default Index;
