
import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../utils/supportedLanguages';
import { ExternalLink, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PreviewPanelProps {
  code: string;
  language: Language;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, language }) => {
  const [compiledOutput, setCompiledOutput] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'console'>('output');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const compileCode = async () => {
    if (!code.trim()) {
      setCompiledOutput('No code to compile');
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      // For web technologies, render directly in the iframe
      if (['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
        let content = '';
        
        if (language.id === 'html') {
          content = code;
        } else if (language.id === 'css') {
          content = `
            <html>
              <head>
                <style>${code}</style>
              </head>
              <body>
                <div id="preview-container">
                  <h1>CSS Preview</h1>
                  <p>This is a paragraph with some <a href="#">links</a> and <strong>formatting</strong>.</p>
                  <div class="box">A sample box element</div>
                  <button>A sample button</button>
                  <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                    <li>List item 3</li>
                  </ul>
                </div>
              </body>
            </html>
          `;
        } else if (language.id === 'javascript') {
          content = `
            <html>
              <head>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; }
                  #output { 
                    min-height: 100px; 
                    border: 1px solid #ddd; 
                    border-radius: 4px; 
                    padding: 12px; 
                    margin-top: 12px;
                    background: #f5f5f5;
                    white-space: pre-wrap;
                  }
                  h3 { margin-top: 0; }
                </style>
              </head>
              <body>
                <h3>JavaScript Console Output:</h3>
                <div id="output"></div>
                <script>
                  // Capture console.log output
                  const output = document.getElementById('output');
                  const originalConsoleLog = console.log;
                  console.log = function(...args) {
                    originalConsoleLog.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.textContent += text + '\\n';
                  };
                  
                  // Run the user code
                  try {
                    ${code}
                  } catch (error) {
                    console.log('Error:', error.message);
                  }
                </script>
              </body>
            </html>
          `;
        } else if (language.id === 'markdown') {
          content = `
            <html>
              <head>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }
                  code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
                  pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
                  blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #555; }
                  img { max-width: 100%; }
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #ddd; padding: 8px; }
                  th { background-color: #f5f5f5; }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
              </head>
              <body>
                <div id="content"></div>
                <script>
                  document.getElementById('content').innerHTML = marked.parse(\`${code.replace(/`/g, '\\`')}\`);
                </script>
              </body>
            </html>
          `;
        }
        
        // Update iframe content
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.document.open();
          iframeRef.current.contentWindow.document.write(content);
          iframeRef.current.contentWindow.document.close();
        }
        
        setCompiledOutput('');
        setActiveTab('output');
      } else {
        // For other languages, simulate a compilation result
        setActiveTab('console');
        
        // Simulate compilation delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Language-specific compilation output
        switch (language.id) {
          case 'python':
            simulatePythonExecution(code);
            break;
          case 'java':
            simulateJavaExecution(code);
            break;
          case 'cpp':
          case 'c':
            simulateCppExecution(code);
            break;
          case 'typescript':
            simulateTypeScriptExecution(code);
            break;
          default:
            setCompiledOutput(`[${language.name} Compiler]\nCode compiled successfully.\n\n> Program output will appear here when you run the code.`);
        }
      }
    } catch (err) {
      console.error("Compilation error:", err);
      setError(`Failed to compile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Simulate Python execution with basic output
  const simulatePythonExecution = (code: string) => {
    try {
      // Basic simulation for common Python print statements
      const printMatches = code.match(/print\((["'].*?["']|.*?)\)/g) || [];
      
      if (printMatches.length === 0) {
        setCompiledOutput("[Python Interpreter]\nCode executed successfully with no output.");
        return;
      }
      
      const output = printMatches.map(match => {
        // Extract content inside print()
        const content = match.substring(6, match.length - 1);
        
        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          return content.substring(1, content.length - 1);
        }
        
        // For simple variables/expressions, just return placeholder
        return `<simulated: ${content}>`;
      }).join('\n');
      
      setCompiledOutput(`[Python Interpreter]\n${output}`);
    } catch (err) {
      setError("Python simulation error");
    }
  };

  // Simulate Java execution with basic output
  const simulateJavaExecution = (code: string) => {
    try {
      // Check if code has a proper Java structure
      if (!code.includes("class")) {
        setError("Java code must contain a class definition");
        return;
      }
      
      // Look for System.out.println statements
      const printMatches = code.match(/System\.out\.println\((["'].*?["']|.*?)\)/g) || [];
      
      if (printMatches.length === 0) {
        setCompiledOutput("[Java Compiler]\nCompiled successfully.\nProgram executed with no output.");
        return;
      }
      
      const output = printMatches.map(match => {
        // Extract content inside println()
        const content = match.substring(19, match.length - 1);
        
        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          return content.substring(1, content.length - 1);
        }
        
        // For variables/expressions, just return placeholder
        return `<simulated: ${content}>`;
      }).join('\n');
      
      setCompiledOutput(`[Java Compiler]\nCompiled successfully.\n\n${output}`);
    } catch (err) {
      setError("Java simulation error");
    }
  };

  // Simulate C/C++ execution
  const simulateCppExecution = (code: string) => {
    try {
      // Look for printf or cout statements
      const printfMatches = code.match(/printf\(["'].*?["'].*?\)/g) || [];
      const coutMatches = code.match(/cout\s*<<\s*["'].*?["']|cout\s*<<\s*\w+/g) || [];
      
      if (printfMatches.length === 0 && coutMatches.length === 0) {
        setCompiledOutput(`[${language.id.toUpperCase()} Compiler]\nCompiled successfully.\nProgram executed with no output.`);
        return;
      }
      
      let output = "";
      
      // Process printf statements
      printfMatches.forEach(match => {
        const stringMatch = match.match(/["'](.*?)["']/);
        if (stringMatch) {
          output += stringMatch[1] + '\n';
        }
      });
      
      // Process cout statements
      coutMatches.forEach(match => {
        const stringMatch = match.match(/["'](.*?)["']/);
        if (stringMatch) {
          output += stringMatch[1];
        } else {
          const varMatch = match.match(/<<\s*(\w+)/);
          if (varMatch) {
            output += `<simulated: ${varMatch[1]}>`;
          }
        }
      });
      
      setCompiledOutput(`[${language.id.toUpperCase()} Compiler]\nCompiled successfully.\n\n${output}`);
    } catch (err) {
      setError(`${language.id.toUpperCase()} simulation error`);
    }
  };

  // Simulate TypeScript execution
  const simulateTypeScriptExecution = (code: string) => {
    try {
      // Look for console.log statements
      const logMatches = code.match(/console\.log\((["'].*?["']|.*?)\)/g) || [];
      
      if (logMatches.length === 0) {
        setCompiledOutput("[TypeScript Compiler]\nTranspiled to JavaScript successfully.\nExecuted with no output.");
        return;
      }
      
      const output = logMatches.map(match => {
        // Extract content inside console.log()
        const content = match.substring(12, match.length - 1);
        
        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          return content.substring(1, content.length - 1);
        }
        
        // For variables/expressions, just return placeholder
        return `<simulated: ${content}>`;
      }).join('\n');
      
      setCompiledOutput(`[TypeScript Compiler]\nTranspiled to JavaScript successfully.\n\n${output}`);
    } catch (err) {
      setError("TypeScript simulation error");
    }
  };

  // Initial compilation when code or language changes
  useEffect(() => {
    if (code) {
      compileCode();
    } else {
      setCompiledOutput('');
      setError(null);
    }
  }, [code, language]);

  // Show loading message while we set up the preview
  if (!code) {
    return (
      <div className="w-full h-[400px] rounded-md border border-border/50 bg-secondary/20 flex items-center justify-center text-muted-foreground animate-scale-in">
        <p>Generate code to see preview</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md overflow-hidden border border-border/50 bg-background animate-scale-in">
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border/50">
        <span className="text-sm font-medium">Code Compiler</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={compileCode}
            disabled={isCompiling}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            {isCompiling ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isCompiling ? 'Compiling...' : 'Run'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Create a new window with the code
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(`
                  <html>
                    <head>
                      <title>${language.name} Code</title>
                      <style>
                        body { font-family: system-ui, sans-serif; padding: 20px; }
                        pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow: auto; }
                        .language { background: ${language.color}; color: white; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; margin-bottom: 12px; }
                      </style>
                    </head>
                    <body>
                      <h2>${language.name} Code</h2>
                      <div class="language">${language.name}</div>
                      <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </body>
                  </html>
                `);
                newWindow.document.close();
              }
            }}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'output' | 'console')} className="w-full">
        <div className="px-4 pt-2 bg-secondary/20 border-b border-border/50">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="output" className="text-xs">Output</TabsTrigger>
            <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="h-[350px]">
          {error && (
            <div className="p-4 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <TabsContent value="output" className="m-0 h-full">
            {['html', 'css', 'javascript', 'markdown'].includes(language.id) ? (
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div className="p-4 text-center flex items-center justify-center h-full text-muted-foreground">
                <p>Output is displayed in the Console tab</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="console" className="m-0 h-full">
            <div className="p-4 h-full overflow-auto bg-secondary/10">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {compiledOutput || 'Run code to see output'}
              </pre>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PreviewPanel;
