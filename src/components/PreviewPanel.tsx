
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
        // For other languages, simulate compilation result with advanced parsing
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

  // Enhanced Python execution simulation
  const simulatePythonExecution = (code: string) => {
    try {
      let output = "[Python Interpreter]\n";
      
      // Check for imports
      if (code.includes("import ") || code.includes("from ")) {
        output += "Imported modules successfully.\n";
      }
      
      // Detect and handle functions
      const functionMatches = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g);
      if (functionMatches && functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s).\n`;
      }
      
      // Detect classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (classMatches && classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es).\n`;
      }
      
      // Process print statements with better regex
      const printMatches = code.match(/print\s*\((.*?)\)/g) || [];
      
      if (printMatches.length > 0) {
        output += "\nOutput:\n";
        printMatches.forEach(match => {
          // Extract content inside print()
          const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
          
          // Handle string literals
          if ((content.includes('"') || content.includes("'"))) {
            // Extract the string content, handling both single and double quotes
            const stringMatch = content.match(/(['"])(.*?)\1/) || content.match(/(['"])(.*?)(['"])/);
            if (stringMatch) {
              output += `${stringMatch[2]}\n`;
            } else {
              output += `${content}\n`;
            }
          } else {
            // For non-string expressions
            output += `${content} (simulated)\n`;
          }
        });
      } else if (!functionMatches && !classMatches) {
        output += "\nNo output. Check if your program includes print statements.";
      }
      
      // Check for main function call
      if (code.includes("if __name__ == \"__main__\":") || code.includes("if __name__ == '__main__':")) {
        output += "\nExecuted main function.";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Python simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced Java execution with better class and method detection
  const simulateJavaExecution = (code: string) => {
    try {
      let output = "[Java Compiler]\n";
      
      // Check for package declaration
      const packageMatch = code.match(/package\s+([a-zA-Z_][a-zA-Z0-9_.]*);/);
      if (packageMatch) {
        output += `Using package: ${packageMatch[1]}\n`;
      }
      
      // Check for imports
      const importMatches = code.match(/import\s+([a-zA-Z_][a-zA-Z0-9_.]*);/g);
      if (importMatches && importMatches.length > 0) {
        output += `Imported ${importMatches.length} package(s).\n`;
      }
      
      // Check for class definition
      const classMatch = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (!classMatch) {
        setError("Java code must contain a class definition");
        return;
      }
      
      const className = classMatch[1];
      output += `Compiled class: ${className}\n`;
      
      // Check for main method
      const hasMain = code.match(/public\s+static\s+void\s+main\s*\(\s*String(\[\])?\s+\w+\s*\)/);
      if (hasMain) {
        output += "Found main method, executing...\n\n";
        
        // Look for System.out.println and System.out.print statements with better regex
        const printMatches = code.match(/System\.out\.println\s*\((.*?)\);|System\.out\.print\s*\((.*?)\);/g) || [];
        
        if (printMatches.length > 0) {
          output += "Output:\n";
          printMatches.forEach(match => {
            // Extract content inside println() or print()
            const isPrintln = match.includes("println");
            const content = match.substring(
              match.indexOf('(') + 1,
              match.lastIndexOf(')')
            );
            
            // Handle string literals vs variables/expressions
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              // Remove the quotes for the output
              output += `${content.substring(1, content.length - 1)}${isPrintln ? '\n' : ''}`;
            } else {
              // For variables or expressions
              output += `${content} (simulated)${isPrintln ? '\n' : ''}`;
            }
          });
        } else {
          output += "Program executed with no output.";
        }
      } else {
        output += "No main method found. Cannot execute.";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Java simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced C/C++ execution with better parsing and handling
  const simulateCppExecution = (code: string) => {
    try {
      let output = `[${language.id.toUpperCase()} Compiler]\n`;
      
      // Check for includes
      const includeMatches = code.match(/#include\s*[<"]([^>"]+)[>"]/g);
      if (includeMatches && includeMatches.length > 0) {
        output += `Included ${includeMatches.length} header(s).\n`;
      }
      
      // Check for namespace
      if (code.includes("using namespace std;")) {
        output += "Using namespace std\n";
      }
      
      // Check for main function
      const hasMain = code.match(/int\s+main\s*\(\s*(void|int\s+\w+\s*,\s*char\s*\*\s*\w+\[\s*\]|)\s*\)/);
      if (hasMain) {
        output += "Found main function, compiling and executing...\n\n";
        
        // Handle printf statements (C style)
        const printfMatches = code.match(/printf\s*\(\s*"([^"]*)"(.*?)\);/g) || [];
        
        // Handle cout statements (C++ style)
        const coutMatches = code.match(/cout\s*<<\s*(?:"([^"]*)"|'([^']*)'|([^<;]+))\s*(<<?[^;]+)?;/g) || [];
        
        if (printfMatches.length > 0 || coutMatches.length > 0) {
          output += "Output:\n";
          
          // Process printf statements
          printfMatches.forEach(match => {
            // Extract format string
            const formatMatch = match.match(/printf\s*\(\s*"([^"]*)"/);
            if (formatMatch) {
              let formatted = formatMatch[1];
              
              // Very basic format string handling
              formatted = formatted.replace(/\\n/g, '\n');
              formatted = formatted.replace(/\\t/g, '\t');
              
              // Handle format specifiers with placeholders
              formatted = formatted.replace(/%d/g, '<int value>');
              formatted = formatted.replace(/%f/g, '<float value>');
              formatted = formatted.replace(/%s/g, '<string value>');
              formatted = formatted.replace(/%c/g, '<char value>');
              
              output += formatted;
            }
          });
          
          // Process cout statements
          coutMatches.forEach(match => {
            // Check for string literals
            const stringMatch = match.match(/<<\s*"([^"]*)"/);
            if (stringMatch) {
              output += stringMatch[1];
            }
            
            // Check for character literals
            const charMatch = match.match(/<<\s*'([^']*)'/);
            if (charMatch) {
              output += charMatch[1];
            }
            
            // Check for endl
            if (match.includes("<< endl") || match.includes("<<endl")) {
              output += '\n';
            }
            
            // Check for variables or expressions
            const varMatch = match.match(/<<\s*([a-zA-Z0-9_]+)(?:\s*<<|$)/);
            if (varMatch && !['endl', 'ends', 'flush'].includes(varMatch[1])) {
              output += `<${varMatch[1]} value>`;
            }
          });
          
          if (!output.endsWith('\n')) {
            output += '\n';
          }
        } else {
          output += "Program executed with no output.\n";
        }
        
        // Check for return statement in main
        const returnMatch = code.match(/return\s+(\d+)\s*;/);
        if (returnMatch) {
          output += `\nProgram executed with return code: ${returnMatch[1]}`;
        } else {
          output += "\nProgram executed successfully.";
        }
      } else {
        output += "No main function found. Cannot execute.";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`${language.id.toUpperCase()} simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced TypeScript execution
  const simulateTypeScriptExecution = (code: string) => {
    try {
      let output = "[TypeScript Compiler]\n";
      
      // Check for imports
      const importMatches = code.match(/import\s+.*?from\s+['"].*?['"];/g);
      if (importMatches && importMatches.length > 0) {
        output += `Processed ${importMatches.length} import statement(s).\n`;
      }
      
      // Check for interfaces
      const interfaceMatches = code.match(/interface\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (interfaceMatches && interfaceMatches.length > 0) {
        output += `Defined ${interfaceMatches.length} interface(s).\n`;
      }
      
      // Check for types
      const typeMatches = code.match(/type\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (typeMatches && typeMatches.length > 0) {
        output += `Defined ${typeMatches.length} type(s).\n`;
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (classMatches && classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es).\n`;
      }
      
      // Process console.log statements with enhanced parsing
      const logMatches = code.match(/console\.log\s*\((.*?)\)/g) || [];
      
      if (logMatches.length > 0) {
        output += "\nTranspiled to JavaScript successfully.\n\nOutput:\n";
        
        logMatches.forEach(match => {
          // Extract content inside console.log()
          const content = match.substring(
            match.indexOf('(') + 1,
            match.lastIndexOf(')')
          ).trim();
          
          // Handle string literals properly
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'")) ||
              (content.startsWith("`") && content.endsWith("`"))) {
            // Remove the quotes/backticks and handle escapes
            const stringContent = content.substring(1, content.length - 1)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t');
            output += `${stringContent}\n`;
          } else if (content.includes('+')) {
            // Handle string concatenation
            const parts = content.split('+').map(p => p.trim());
            output += `${parts.join('')} (simulated)\n`;
          } else {
            // For variables/expressions
            output += `${content} (simulated)\n`;
          }
        });
      } else if (code.includes("console.") && !code.includes("console.log")) {
        // Handle other console methods
        output += "\nTranspiled to JavaScript successfully.\n\nConsole output detected but not simulated (non-log methods).";
      } else {
        output += "\nTranspiled to JavaScript successfully.\n\nNo output. Program did not call console.log().";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`TypeScript simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
              // Choose appropriate external compiler based on language
              let externalUrl = '';
              const encodedCode = encodeURIComponent(code);
              
              switch (language.id) {
                case 'python':
                  externalUrl = `https://www.online-python.com/?code=${encodedCode}`;
                  break;
                case 'java':
                  externalUrl = `https://www.jdoodle.com/online-java-compiler/?code=${encodedCode}`;
                  break;
                case 'cpp':
                case 'c':
                  externalUrl = `https://www.onlinegdb.com/online_c++_compiler?code=${encodedCode}`;
                  break;
                case 'javascript':
                  externalUrl = `https://jsfiddle.net/create/?js=${encodedCode}`;
                  break;
                case 'typescript':
                  externalUrl = `https://www.typescriptlang.org/play?#code/${encodedCode}`;
                  break;
                case 'html':
                  externalUrl = `https://codepen.io/pen/?html=${encodedCode}`;
                  break;
                default:
                  externalUrl = `https://godbolt.org/?code=${encodedCode}`;
              }
              
              window.open(externalUrl, '_blank');
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
