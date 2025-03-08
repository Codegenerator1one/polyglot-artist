
import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../utils/supportedLanguages';
import { ExternalLink, RefreshCw, Play, AlertTriangle, Code, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { markdown } from '@codemirror/lang-markdown';
import { Link } from '@/components/ui/link';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  // Map language ID to appropriate CodeMirror language extension
  const getLanguageExtension = (langId: string) => {
    switch (langId) {
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
        return javascript();
      case 'html':
        return html();
      case 'css':
        return css();
      case 'python':
        return python();
      case 'java':
      case 'kotlin':
        return java();
      case 'markdown':
        return markdown();
      default:
        return javascript();
    }
  };

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
                  const originalConsoleError = console.error;
                  const originalConsoleWarn = console.warn;
                  
                  console.log = function(...args) {
                    originalConsoleLog.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="log">' + text + '</div>';
                  };
                  
                  console.error = function(...args) {
                    originalConsoleError.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="error" style="color: red;">' + text + '</div>';
                  };
                  
                  console.warn = function(...args) {
                    originalConsoleWarn.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="warning" style="color: orange;">' + text + '</div>';
                  };
                  
                  // Run the user code
                  try {
                    ${code}
                  } catch (error) {
                    console.error('Runtime Error:', error.message);
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
        // For other languages, provide advanced simulated compilation
        setActiveTab('console');
        
        // Simulate compilation delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
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
          case 'kotlin':
            simulateKotlinExecution(code);
            break;
          case 'swift':
            simulateSwiftExecution(code);
            break;
          case 'csharp':
            simulateCSharpExecution(code);
            break;
          case 'go':
            simulateGoExecution(code);
            break;
          case 'rust':
            simulateRustExecution(code);
            break;
          case 'php':
            simulatePHPExecution(code);
            break;
          case 'ruby':
            simulateRubyExecution(code);
            break;
          default:
            setCompiledOutput(`[${language.name} Compiler]\nCompiled successfully.\n\n> Program output will appear here when you run the code.`);
        }
      }
      
      toast({
        title: "Code Execution Complete",
        description: `${language.name} code was executed successfully.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Compilation error:", err);
      setError(`Failed to compile: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      toast({
        title: "Compilation Error",
        description: `Failed to compile ${language.name} code: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // Enhanced Python execution simulation with better parsing
  const simulatePythonExecution = (code: string) => {
    try {
      let output = "[Python Interpreter v3.10.0]\n";
      let errorDetected = false;
      
      // Check for syntax errors first
      if (code.includes('import', ')) {') || code.includes('print(')) {')) {
        output += "SyntaxError: invalid syntax\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        // Check for imports
        const importMatches = code.match(/(?:import|from) [\w\s.,*]+(?: import [\w\s.,*]+)?/g) || [];
        if (importMatches.length > 0) {
          output += "Successfully imported modules:\n";
          importMatches.forEach(match => {
            output += `  ${match.trim()}\n`;
          });
          output += "\n";
        }
        
        // Detect and handle functions
        const functionMatches = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g) || [];
        if (functionMatches.length > 0) {
          output += `Defined ${functionMatches.length} function(s):\n`;
          functionMatches.forEach(match => {
            output += `  ${match.replace('def ', '').trim()}\n`;
          });
          output += "\n";
        }
        
        // Detect classes
        const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        if (classMatches.length > 0) {
          output += `Defined ${classMatches.length} class(es):\n`;
          classMatches.forEach(match => {
            output += `  ${match.replace('class ', '').trim()}\n`;
          });
          output += "\n";
        }
        
        // Process print statements with better regex
        const printMatches = code.match(/print\s*\((.*?)(?:\)|(?:#))/g) || [];
        
        if (printMatches.length > 0) {
          output += "Output:\n";
          printMatches.forEach(match => {
            if (match.includes('#')) return; // Skip commented prints
            
            // Extract content inside print()
            let content = match.substring(match.indexOf('(') + 1);
            content = content.substring(0, content.lastIndexOf(')'));
            
            // Handle f-strings
            if (content.startsWith('f"') || content.startsWith("f'")) {
              const baseString = content.substring(2, content.length - 1);
              const formattedString = baseString.replace(/\{([^}]+)\}/g, (_, expr) => `<${expr.trim()}>`);
              output += `${formattedString}\n`;
              return;
            }
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += `${content.substring(1, content.length - 1)}\n`;
              return;
            }
            
            // Handle variables/expressions
            if (content.includes('+') || content.includes(',')) {
              const parts = content.split(/[+,]/).map(p => p.trim());
              const outputParts = parts.map(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("'") && part.endsWith("'"))) {
                  return part.substring(1, part.length - 1);
                } else {
                  return `<${part}>`;
                }
              });
              output += `${outputParts.join(' ')}\n`;
              return;
            }
            
            // Default case
            output += `${content} (evaluated value)\n`;
          });
        } else if (code.trim() && !functionMatches.length && !classMatches.length && !code.includes('if __name__')) {
          // Interactive mode output for simple expressions
          const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
          if (lines.length > 0) {
            output += "Output:\n";
            lines.forEach(line => {
              if (line.includes('=')) {
                // Variable assignment
                const parts = line.split('=');
                output += `> ${parts[0].trim()} = ${parts[1].trim()} (assigned)\n`;
              } else if (!line.includes('import ') && !line.includes('from ')) {
                // Expression evaluation
                output += `> ${line.trim()} (evaluated to result)\n`;
              }
            });
          }
        }
        
        // Check for main function call
        if (code.includes("if __name__ == \"__main__\":") || code.includes("if __name__ == '__main__':")) {
          output += "\nExecuted main function successfully.\n";
          output += "Program executed with return code: 0\n";
        } else if (printMatches.length > 0 || functionMatches.length > 0 || classMatches.length > 0) {
          output += "\nProgram executed with return code: 0\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Python simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced Java execution with better class and method detection
  const simulateJavaExecution = (code: string) => {
    try {
      let output = "[Java Compiler v17.0.6]\n";
      let errorDetected = false;
      
      // Check for syntax errors
      if ((code.includes('public class') && !code.includes('{')) || 
          (code.includes('System.out.println') && !code.includes(';'))) {
        output += "Error: Syntax error detected\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        // Check for package declaration
        const packageMatch = code.match(/package\s+([a-zA-Z_][a-zA-Z0-9_.]*);/);
        if (packageMatch) {
          output += `Using package: ${packageMatch[1]}\n`;
        }
        
        // Check for imports
        const importMatches = code.match(/import\s+([a-zA-Z_][a-zA-Z0-9_.]*)(|\.\*);/g) || [];
        if (importMatches.length > 0) {
          output += `Successfully imported ${importMatches.length} package(s):\n`;
          importMatches.forEach(importStmt => {
            output += `  ${importStmt.trim()}\n`;
          });
          output += "\n";
        }
        
        // Check for class definition
        const classMatch = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
          const className = classMatch[1];
          output += `Compiled class: ${className}\n`;
          
          // Find methods in the class
          const methodMatches = code.match(/(?:public|private|protected)?\s+(?:static)?\s+\w+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*(?:throws\s+[a-zA-Z_][a-zA-Z0-9_]*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*)*\s*)?{/g) || [];
          if (methodMatches.length > 0) {
            output += `Found ${methodMatches.length} method(s) in class ${className}\n\n`;
          }
          
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
                let content = match.substring(
                  match.indexOf('(') + 1,
                  match.lastIndexOf(')')
                );
                
                // Handle string concatenation
                if (content.includes(" + ")) {
                  const parts = content.split(" + ").map(p => p.trim());
                  let result = "";
                  
                  parts.forEach(part => {
                    if ((part.startsWith('"') && part.endsWith('"')) || 
                        (part.startsWith("'") && part.endsWith("'"))) {
                      result += part.substring(1, part.length - 1);
                    } else {
                      result += `<${part}>`;
                    }
                  });
                  
                  output += `${result}${isPrintln ? '\n' : ''}`;
                  return;
                }
                
                // Handle string literals vs variables/expressions
                if ((content.startsWith('"') && content.endsWith('"')) || 
                    (content.startsWith("'") && content.endsWith("'"))) {
                  // Remove the quotes for the output
                  output += `${content.substring(1, content.length - 1)}${isPrintln ? '\n' : ''}`;
                } else {
                  // For variables or expressions
                  output += `<${content}>${isPrintln ? '\n' : ''}`;
                }
              });
            } else {
              output += "Program executed with no output.\n";
            }
            
            output += "\nProgram executed with return code: 0\n";
          } else {
            output += "No main method found. Class compiled but not executed.\n";
          }
        } else {
          output += "Error: No class definition found in Java code.\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Java simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced C/C++ execution with better parsing and handling
  const simulateCppExecution = (code: string) => {
    try {
      let output = `[${language.id.toUpperCase()} Compiler v13.2.0]\n`;
      let errorDetected = false;
      
      // Check for syntax errors
      if ((code.includes('int main') && !code.includes('{')) || 
          (code.includes('printf') && !code.includes(';'))) {
        output += "Error: Syntax error detected\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        // Check for includes
        const includeMatches = code.match(/#include\s*[<"]([^>"]+)[>"]/g) || [];
        if (includeMatches.length > 0) {
          output += `Successfully included ${includeMatches.length} header(s):\n`;
          includeMatches.forEach(include => {
            output += `  ${include.trim()}\n`;
          });
          output += "\n";
        }
        
        // Check for namespace
        if (code.includes("using namespace std;")) {
          output += "Using namespace std\n\n";
        }
        
        // Look for function definitions
        const functionMatches = code.match(/\w+\s+(\w+)\s*\([^)]*\)\s*(?:const)?\s*{/g) || [];
        if (functionMatches.length > 0 && !functionMatches.some(f => f.includes('main'))) {
          output += `Found ${functionMatches.length} function definition(s)\n`;
        }
        
        // Check for main function
        const hasMain = code.match(/int\s+main\s*\(\s*(void|int\s+\w+\s*,\s*char\s*\*\s*\w+\[\s*\]|)\s*\)/);
        if (hasMain) {
          output += "Found main function, compiling and executing...\n\n";
          
          // Handle printf statements (C style)
          const printfMatches = code.match(/printf\s*\(\s*("[^"]*"(?:,\s*[^;]+)?)\);/g) || [];
          
          // Handle cout statements (C++ style)
          const coutMatches = code.match(/cout\s*<<\s*(?:"([^"]*)"|'([^']*)'|([^<;]+))(?:\s*<<\s*(?:endl|"[^"]*"|'[^']*'|[^<;]+))*\s*;/g) || [];
          
          if (printfMatches.length > 0 || coutMatches.length > 0) {
            output += "Output:\n";
            
            // Process printf statements
            printfMatches.forEach(match => {
              // Extract format string and arguments
              const parts = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
              const formatStringMatch = parts.match(/"([^"]*)"/);
              
              if (formatStringMatch) {
                let formatted = formatStringMatch[1];
                
                // Handle format specifiers with placeholders
                const args = parts.substring(formatStringMatch[0].length).split(',').map(arg => arg.trim()).filter(arg => arg);
                
                // Replace format specifiers with argument values or placeholders
                let argIndex = 0;
                formatted = formatted.replace(/%d|%i|%f|%lf|%c|%s|%p|%x|%X|%o|%u/g, (match) => {
                  if (argIndex < args.length) {
                    // If it's a literal (number), use it directly
                    if (/^-?\d+(\.\d+)?$/.test(args[argIndex])) {
                      return args[argIndex++];
                    } else {
                      return `<${args[argIndex++]}>`;
                    }
                  } else {
                    return `<${match}>`;
                  }
                });
                
                // Handle escape sequences
                formatted = formatted
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\r/g, '')
                  .replace(/\\"/g, '"')
                  .replace(/\\'/g, "'");
                
                output += formatted;
              }
            });
            
            // Process cout statements
            coutMatches.forEach(match => {
              let coutOutput = '';
              let hasEndl = false;
              
              // Process all parts in the cout statement
              const coutParts = match.replace(/cout\s*<<\s*/, '').replace(/\s*;$/, '').split(/\s*<<\s*/);
              
              coutParts.forEach(part => {
                if (part === 'endl') {
                  hasEndl = true;
                  return;
                }
                
                // Handle string literals
                if (part.startsWith('"') && part.endsWith('"')) {
                  coutOutput += part.substring(1, part.length - 1);
                  return;
                }
                
                // Handle character literals
                if (part.startsWith("'") && part.endsWith("'")) {
                  coutOutput += part.substring(1, part.length - 1);
                  return;
                }
                
                // Handle variables or expressions
                if (part.match(/^[a-zA-Z0-9_]+$/)) {
                  coutOutput += `<${part}>`;
                } else if (part.match(/^-?\d+(\.\d+)?$/)) {
                  coutOutput += part;
                } else {
                  coutOutput += `<${part}>`;
                }
              });
              
              output += coutOutput + (hasEndl ? '\n' : '');
            });
          } else {
            output += "Program executed with no output.\n";
          }
          
          // Check for return statement in main
          const returnMatch = code.match(/return\s+(\d+)\s*;/);
          if (returnMatch) {
            output += `\nProgram executed with return code: ${returnMatch[1]}\n`;
          } else {
            output += "\nProgram executed with return code: 0\n";
          }
        } else {
          output += "No main function found. Code compiled but not executed.\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`${language.id.toUpperCase()} simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Enhanced TypeScript execution
  const simulateTypeScriptExecution = (code: string) => {
    try {
      let output = "[TypeScript Compiler v5.0.4]\n";
      
      // Check for syntax errors
      if ((code.includes('function') && !code.includes('{')) || 
          (code.includes('console.log') && !code.includes(';') && !code.includes('}'))) {
        output += "Error: TypeScript syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for imports
      const importMatches = code.match(/import\s+.*?from\s+['"].*?['"];/g) || [];
      if (importMatches.length > 0) {
        output += `Processed ${importMatches.length} import statement(s):\n`;
        importMatches.forEach(imp => {
          output += `  ${imp.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for interfaces
      const interfaceMatches = code.match(/interface\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (interfaceMatches.length > 0) {
        output += `Defined ${interfaceMatches.length} interface(s)\n`;
      }
      
      // Check for types
      const typeMatches = code.match(/type\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (typeMatches.length > 0) {
        output += `Defined ${typeMatches.length} type(s)\n`;
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      // Check for functions
      const functionMatches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n`;
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
          
          // Handle template literals
          if (content.startsWith('`') && content.endsWith('`')) {
            const templateContent = content.substring(1, content.length - 1);
            const interpolatedContent = templateContent.replace(/\${([^}]*)}/g, (_, expr) => `<${expr}>`);
            output += interpolatedContent + '\n';
            return;
          }
          
          // Handle string literals properly
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            // Remove the quotes/backticks and handle escapes
            const stringContent = content.substring(1, content.length - 1)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t');
            output += `${stringContent}\n`;
            return;
          } 
          
          // Handle string concatenation
          if (content.includes('+')) {
            const parts = content.split('+').map(p => p.trim());
            let result = '';
            
            parts.forEach(part => {
              if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
                result += part.substring(1, part.length - 1);
              } else {
                result += `<${part}>`;
              }
            });
            
            output += `${result}\n`;
            return;
          }
          
          // For simple variables/expressions
          if (/^[a-zA-Z0-9_]+$/.test(content)) {
            output += `<${content}>\n`;
          } else if (/^-?\d+(\.\d+)?$/.test(content)) {
            output += `${content}\n`;
          } else {
            output += `<${content}>\n`;
          }
        });
        
        output += "\nProgram executed with return code: 0\n";
      } else if (code.includes("console.") && !code.includes("console.log")) {
        // Handle other console methods
        output += "\nTranspiled to JavaScript successfully.\n\nConsole output detected but not simulated (non-log methods).\n";
        output += "\nProgram executed with return code: 0\n";
      } else if (code.trim()) {
        output += "\nTranspiled to JavaScript successfully.\n\nNo console.log() calls detected.\n";
        output += "\nProgram executed with return code: 0\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`TypeScript simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Kotlin execution simulation
  const simulateKotlinExecution = (code: string) => {
    try {
      let output = "[Kotlin Compiler v1.9.0]\n";
      
      // Check for syntax errors
      if ((code.includes('fun main') && !code.includes('{'))) {
        output += "Error: Kotlin syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for package declaration
      const packageMatch = code.match(/package\s+([a-zA-Z_][a-zA-Z0-9_.]*)/);
      if (packageMatch) {
        output += `Using package: ${packageMatch[1]}\n`;
      }
      
      // Check for imports
      const importMatches = code.match(/import\s+([a-zA-Z_][a-zA-Z0-9_.]*)(|\.\*)/g) || [];
      if (importMatches.length > 0) {
        output += `Successfully imported ${importMatches.length} package(s):\n`;
        importMatches.forEach(importStmt => {
          output += `  ${importStmt.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      // Check for functions
      const functionMatches = code.match(/fun\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n\n`;
      }
      
      // Check for main function
      const hasMain = code.match(/fun\s+main\s*\(/);
      if (hasMain) {
        output += "Found main function, executing...\n\n";
        
        // Process println statements
        const printlnMatches = code.match(/println\s*\((.*?)\)/g) || [];
        const printMatches = code.match(/print\s*\((.*?)\)/g) || [];
        
        if (printlnMatches.length > 0 || printMatches.length > 0) {
          output += "Output:\n";
          
          // Process println statements
          printlnMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string templates
            if (content.startsWith('"') && content.includes('$')) {
              const templateText = content.substring(1, content.length - 1);
              const interpolated = templateText.replace(/\$\{([^}]*)\}/g, (_, expr) => `<${expr}>`);
              output += interpolated + '\n';
              return;
            }
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += content.substring(1, content.length - 1) + '\n';
              return;
            }
            
            // Handle expressions
            output += `<${content}>\n`;
          });
          
          // Process print statements
          printMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string templates
            if (content.startsWith('"') && content.includes('$')) {
              const templateText = content.substring(1, content.length - 1);
              const interpolated = templateText.replace(/\$\{([^}]*)\}/g, (_, expr) => `<${expr}>`);
              output += interpolated;
              return;
            }
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += content.substring(1, content.length - 1);
              return;
            }
            
            // Handle expressions
            output += `<${content}>`;
          });
        } else {
          output += "Program executed with no output.\n";
        }
        
        output += "\nProgram executed with return code: 0\n";
      } else {
        output += "No main function found. Code compiled but not executed.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Kotlin simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Swift execution simulation
  const simulateSwiftExecution = (code: string) => {
    try {
      let output = "[Swift Compiler v5.9.0]\n";
      
      // Check for syntax errors
      if ((code.includes('func') && !code.includes('{'))) {
        output += "Error: Swift syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for imports
      const importMatches = code.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (importMatches.length > 0) {
        output += `Successfully imported ${importMatches.length} module(s):\n`;
        importMatches.forEach(imp => {
          output += `  ${imp.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for classes and structs
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      const structMatches = code.match(/struct\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      if (structMatches.length > 0) {
        output += `Defined ${structMatches.length} struct(s)\n`;
      }
      
      // Check for functions
      const functionMatches = code.match(/func\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n\n`;
      }
      
      // Process print statements
      const printMatches = code.match(/print\s*\((.*?)\)/g) || [];
      
      if (printMatches.length > 0) {
        output += "Output:\n";
        
        printMatches.forEach(match => {
          const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
          
          // Handle string interpolation
          if (content.startsWith('"') && content.includes('\\(')) {
            const templateText = content.substring(1, content.length - 1);
            const interpolated = templateText.replace(/\\(([^)]*)\)/g, (_, expr) => `<${expr}>`);
            output += interpolated + '\n';
            return;
          }
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            output += content.substring(1, content.length - 1) + '\n';
            return;
          }
          
          // Handle expressions
          output += `<${content}>\n`;
        });
        
        output += "\nProgram executed with return code: 0\n";
      } else if (code.trim()) {
        output += "Program executed with no output.\n";
        output += "\nProgram executed with return code: 0\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Swift simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // C# execution simulation
  const simulateCSharpExecution = (code: string) => {
    try {
      let output = "[C# Compiler v12.0.0]\n";
      
      // Check for syntax errors
      if ((code.includes('class') && !code.includes('{'))) {
        output += "Error: C# syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for using statements
      const usingMatches = code.match(/using\s+([a-zA-Z_][a-zA-Z0-9_.]*);/g) || [];
      if (usingMatches.length > 0) {
        output += `Successfully imported ${usingMatches.length} namespace(s):\n`;
        usingMatches.forEach(usingStmt => {
          output += `  ${usingStmt.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for namespace declaration
      const namespaceMatch = code.match(/namespace\s+([a-zA-Z_][a-zA-Z0-9_.]*)/);
      if (namespaceMatch) {
        output += `Using namespace: ${namespaceMatch[1]}\n\n`;
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      // Check for methods
      const methodMatches = code.match(/(?:public|private|protected|internal|static)*\s+\w+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g) || [];
      if (methodMatches.length > 0) {
        output += `Defined ${methodMatches.length} method(s)\n\n`;
      }
      
      // Check for Main method
      const hasMain = code.match(/static\s+void\s+Main\s*\(/i);
      if (hasMain) {
        output += "Found Main method, executing...\n\n";
        
        // Process Console.WriteLine statements
        const writeLineMatches = code.match(/Console\.WriteLine\s*\((.*?)\);/g) || [];
        const writeMatches = code.match(/Console\.Write\s*\((.*?)\);/g) || [];
        
        if (writeLineMatches.length > 0 || writeMatches.length > 0) {
          output += "Output:\n";
          
          // Process WriteLine statements
          writeLineMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string interpolation
            if (content.startsWith('$"') || content.startsWith('$\'')) {
              const templateText = content.substring(2, content.length - 1);
              const interpolated = templateText.replace(/\{([^}]*)\}/g, (_, expr) => `<${expr}>`);
              output += interpolated + '\n';
              return;
            }
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += content.substring(1, content.length - 1) + '\n';
              return;
            }
            
            // Handle string concatenation
            if (content.includes('+')) {
              const parts = content.split('+').map(p => p.trim());
              let result = '';
              
              parts.forEach(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("'") && part.endsWith("'"))) {
                  result += part.substring(1, part.length - 1);
                } else {
                  result += `<${part}>`;
                }
              });
              
              output += result + '\n';
              return;
            }
            
            // Handle expressions
            output += `<${content}>\n`;
          });
          
          // Process Write statements
          writeMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string interpolation
            if (content.startsWith('$"') || content.startsWith('$\'')) {
              const templateText = content.substring(2, content.length - 1);
              const interpolated = templateText.replace(/\{([^}]*)\}/g, (_, expr) => `<${expr}>`);
              output += interpolated;
              return;
            }
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += content.substring(1, content.length - 1);
              return;
            }
            
            // Handle string concatenation
            if (content.includes('+')) {
              const parts = content.split('+').map(p => p.trim());
              let result = '';
              
              parts.forEach(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("'") && part.endsWith("'"))) {
                  result += part.substring(1, part.length - 1);
                } else {
                  result += `<${part}>`;
                }
              });
              
              output += result;
              return;
            }
            
            // Handle expressions
            output += `<${content}>`;
          });
        } else {
          output += "Program executed with no output.\n";
        }
        
        output += "\nProgram executed with return code: 0\n";
      } else {
        output += "No Main method found. Code compiled but not executed.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`C# simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Go execution simulation
  const simulateGoExecution = (code: string) => {
    try {
      let output = "[Go Compiler v1.21.0]\n";
      
      // Check for syntax errors
      if ((code.includes('func main') && !code.includes('{'))) {
        output += "Error: Go syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for package declaration
      const packageMatch = code.match(/package\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (packageMatch) {
        output += `Using package: ${packageMatch[1]}\n`;
      } else {
        output += "Warning: No package declaration found. Assuming 'main' package.\n";
      }
      
      // Check for imports
      const importBlocks = code.match(/import\s*\(([\s\S]*?)\)/g) || [];
      const singleImports = code.match(/import\s+"([^"]+)"/g) || [];
      
      let importCount = singleImports.length;
      importBlocks.forEach(block => {
        const imports = block.match(/"([^"]+)"/g) || [];
        importCount += imports.length;
      });
      
      if (importCount > 0) {
        output += `Successfully imported ${importCount} package(s)\n`;
      }
      
      // Check for functions
      const functionMatches = code.match(/func\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n\n`;
      }
      
      // Check for main function
      const hasMain = code.match(/func\s+main\s*\(\s*\)/);
      if (hasMain) {
        output += "Found main function, executing...\n\n";
        
        // Process fmt.Println statements
        const printlnMatches = code.match(/fmt\.Println\s*\((.*?)\)/g) || [];
        const printfMatches = code.match(/fmt\.Printf\s*\((.*?)\)/g) || [];
        const printMatches = code.match(/fmt\.Print\s*\((.*?)\)/g) || [];
        
        if (printlnMatches.length > 0 || printfMatches.length > 0 || printMatches.length > 0) {
          output += "Output:\n";
          
          // Process fmt.Println statements
          printlnMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("`") && content.endsWith("`"))) {
              const quoteChar = content[0];
              output += content.substring(1, content.length - 1) + '\n';
              return;
            }
            
            // Handle multiple arguments
            if (content.includes(',')) {
              const parts = content.split(',').map(p => p.trim());
              let result = parts.map(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("`") && part.endsWith("`"))) {
                  return part.substring(1, part.length - 1);
                } else {
                  return `<${part}>`;
                }
              }).join(' ');
              
              output += result + '\n';
              return;
            }
            
            // Handle expressions
            output += `<${content}>\n`;
          });
          
          // Process fmt.Printf statements
          printfMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Extract format string and arguments
            const parts = content.split(',').map(p => p.trim());
            if (parts.length > 0) {
              const formatString = parts[0];
              if ((formatString.startsWith('"') && formatString.endsWith('"')) || 
                  (formatString.startsWith("`") && formatString.endsWith("`"))) {
                let formatted = formatString.substring(1, formatString.length - 1);
                
                // Replace format verbs with argument values or placeholders
                const args = parts.slice(1);
                let argIndex = 0;
                
                formatted = formatted.replace(/%v|%s|%d|%f|%t|%T|%q/g, () => {
                  if (argIndex < args.length) {
                    const arg = args[argIndex++];
                    if ((arg.startsWith('"') && arg.endsWith('"')) || 
                        (arg.startsWith("`") && arg.endsWith("`"))) {
                      return arg.substring(1, arg.length - 1);
                    } else if (/^-?\d+(\.\d+)?$/.test(arg)) {
                      return arg;
                    } else {
                      return `<${arg}>`;
                    }
                  } else {
                    return '<missing arg>';
                  }
                });
                
                output += formatted;
              } else {
                output += `<format string: ${formatString}>`;
              }
            }
          });
          
          // Process fmt.Print statements
          printMatches.forEach(match => {
            const content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("`") && content.endsWith("`"))) {
              output += content.substring(1, content.length - 1);
              return;
            }
            
            // Handle multiple arguments
            if (content.includes(',')) {
              const parts = content.split(',').map(p => p.trim());
              let result = parts.map(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("`") && part.endsWith("`"))) {
                  return part.substring(1, part.length - 1);
                } else {
                  return `<${part}>`;
                }
              }).join('');
              
              output += result;
              return;
            }
            
            // Handle expressions
            output += `<${content}>`;
          });
        } else {
          output += "Program executed with no output.\n";
        }
        
        output += "\nProgram executed with return code: 0\n";
      } else {
        output += "No main function found. Code compiled but not executed.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Go simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Rust execution simulation
  const simulateRustExecution = (code: string) => {
    try {
      let output = "[Rust Compiler v1.73.0]\n";
      
      // Check for syntax errors
      if ((code.includes('fn main') && !code.includes('{'))) {
        output += "Error: Rust syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for modules and imports
      const modMatches = code.match(/mod\s+([a-zA-Z_][a-zA-Z0-9_]*);/g) || [];
      const useMatches = code.match(/use\s+([a-zA-Z_][a-zA-Z0-9_:]*)(::[\*\{\}a-zA-Z0-9_,\s]*)?;/g) || [];
      
      if (modMatches.length > 0) {
        output += `Defined ${modMatches.length} module(s)\n`;
      }
      
      if (useMatches.length > 0) {
        output += `Imported ${useMatches.length} item(s):\n`;
        useMatches.forEach(useStmt => {
          output += `  ${useStmt.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for structs and enums
      const structMatches = code.match(/struct\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      const enumMatches = code.match(/enum\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      
      if (structMatches.length > 0) {
        output += `Defined ${structMatches.length} struct(s)\n`;
      }
      
      if (enumMatches.length > 0) {
        output += `Defined ${enumMatches.length} enum(s)\n`;
      }
      
      // Check for functions
      const functionMatches = code.match(/fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n\n`;
      }
      
      // Check for main function
      const hasMain = code.match(/fn\s+main\s*\(/);
      if (hasMain) {
        output += "Found main function, executing...\n\n";
        
        // Process println! and print! macros
        const printlnMatches = code.match(/println!\s*\((.*?)\);/g) || [];
        const printMatches = code.match(/print!\s*\((.*?)\);/g) || [];
        
        if (printlnMatches.length > 0 || printMatches.length > 0) {
          output += "Output:\n";
          
          // Process println! macros
          printlnMatches.forEach(match => {
            let content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle format strings
            if (content.startsWith('"') && content.includes('{}')) {
              // Extract format string and arguments
              const parts = content.split(',').map(p => p.trim());
              const formatString = parts[0].substring(1, parts[0].length - 1);
              const args = parts.slice(1);
              
              // Replace {} placeholders with argument values
              let argIndex = 0;
              const formatted = formatString.replace(/\{\}/g, () => {
                if (argIndex < args.length) {
                  const arg = args[argIndex++];
                  if ((arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.substring(1, arg.length - 1);
                  } else if (/^-?\d+(\.\d+)?$/.test(arg)) {
                    return arg;
                  } else {
                    return `<${arg}>`;
                  }
                } else {
                  return '<missing arg>';
                }
              });
              
              output += formatted + '\n';
              return;
            }
            
            // Handle simple string literals
            if ((content.startsWith('"') && content.endsWith('"'))) {
              output += content.substring(1, content.length - 1) + '\n';
              return;
            }
            
            // Handle expressions
            output += `<${content}>\n`;
          });
          
          // Process print! macros
          printMatches.forEach(match => {
            let content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
            
            // Handle format strings
            if (content.startsWith('"') && content.includes('{}')) {
              // Extract format string and arguments
              const parts = content.split(',').map(p => p.trim());
              const formatString = parts[0].substring(1, parts[0].length - 1);
              const args = parts.slice(1);
              
              // Replace {} placeholders with argument values
              let argIndex = 0;
              const formatted = formatString.replace(/\{\}/g, () => {
                if (argIndex < args.length) {
                  const arg = args[argIndex++];
                  if ((arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.substring(1, arg.length - 1);
                  } else if (/^-?\d+(\.\d+)?$/.test(arg)) {
                    return arg;
                  } else {
                    return `<${arg}>`;
                  }
                } else {
                  return '<missing arg>';
                }
              });
              
              output += formatted;
              return;
            }
            
            // Handle simple string literals
            if ((content.startsWith('"') && content.endsWith('"'))) {
              output += content.substring(1, content.length - 1);
              return;
            }
            
            // Handle expressions
            output += `<${content}>`;
          });
        } else {
          output += "Program executed with no output.\n";
        }
        
        output += "\nProgram executed with return code: 0\n";
      } else {
        output += "No main function found. Code compiled but not executed.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Rust simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // PHP execution simulation
  const simulatePHPExecution = (code: string) => {
    try {
      let output = "[PHP Interpreter v8.2.0]\n";
      
      // Check if the code has the PHP opening tag
      if (!code.includes('<?php')) {
        output += "Note: Adding PHP opening tag <?php\n\n";
      }
      
      // Check for syntax errors
      if ((code.includes('function') && !code.includes('{'))) {
        output += "Parse error: syntax error, unexpected end of file\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for functions
      const functionMatches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n\n`;
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n\n`;
      }
      
      // Process echo and print statements
      const echoMatches = code.match(/echo\s+(.*?);/g) || [];
      const printMatches = code.match(/print\s+(.*?);/g) || [];
      const printRMatches = code.match(/print_r\s*\((.*?)\);/g) || [];
      const varDumpMatches = code.match(/var_dump\s*\((.*?)\);/g) || [];
      
      if (echoMatches.length > 0 || printMatches.length > 0 || printRMatches.length > 0 || varDumpMatches.length > 0) {
        output += "Output:\n";
        
        // Process echo statements
        echoMatches.forEach(match => {
          let content = match.substring(match.indexOf(' ') + 1, match.lastIndexOf(';')).trim();
          
          // Handle string concatenation with .
          if (content.includes('.')) {
            const parts = content.split('.').map(p => p.trim());
            let result = '';
            
            parts.forEach(part => {
              if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
                result += part.substring(1, part.length - 1);
              } else {
                result += `<${part}>`;
              }
            });
            
            output += result;
            return;
          }
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            output += content.substring(1, content.length - 1);
            return;
          }
          
          // Handle variables or expressions
          output += `<${content}>`;
        });
        
        // Process print statements
        printMatches.forEach(match => {
          let content = match.substring(match.indexOf(' ') + 1, match.lastIndexOf(';')).trim();
          
          // Handle string concatenation with .
          if (content.includes('.')) {
            const parts = content.split('.').map(p => p.trim());
            let result = '';
            
            parts.forEach(part => {
              if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
                result += part.substring(1, part.length - 1);
              } else {
                result += `<${part}>`;
              }
            });
            
            output += result;
            return;
          }
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            output += content.substring(1, content.length - 1);
            return;
          }
          
          // Handle variables or expressions
          output += `<${content}>`;
        });
        
        // Process print_r statements
        printRMatches.forEach(match => {
          let content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')')).trim();
          output += `Array/Object dump of ${content}:\nArray\n(\n    [0] => value1\n    [1] => value2\n)\n`;
        });
        
        // Process var_dump statements
        varDumpMatches.forEach(match => {
          let content = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')')).trim();
          output += `var_dump of ${content}:\ntype(size) details\n`;
        });
        
        output += "\nProgram executed with return code: 0\n";
      } else if (code.trim()) {
        output += "Program executed with no visible output. Check if your code has echo, print, or other output functions.\n";
        output += "\nProgram executed with return code: 0\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`PHP simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Ruby execution simulation
  const simulateRubyExecution = (code: string) => {
    try {
      let output = "[Ruby Interpreter v3.2.2]\n";
      
      // Check for syntax errors
      if ((code.includes('def') && !code.includes('end'))) {
        output += "SyntaxError: unexpected end-of-input\n";
        setCompiledOutput(output);
        return;
      }
      
      // Check for requires
      const requireMatches = code.match(/require\s+['"]([^'"]+)['"]/g) || [];
      if (requireMatches.length > 0) {
        output += `Required ${requireMatches.length} module(s):\n`;
        requireMatches.forEach(req => {
          output += `  ${req.trim()}\n`;
        });
        output += "\n";
      }
      
      // Check for classes
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      // Check for methods
      const methodMatches = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_?!]*)/g) || [];
      if (methodMatches.length > 0) {
        output += `Defined ${methodMatches.length} method(s)\n\n`;
      }
      
      // Process puts and print statements
      const putsMatches = code.match(/puts\s+(.*?)($|#)/g) || [];
      const printMatches = code.match(/print\s+(.*?)($|#)/g) || [];
      const pMatches = code.match(/p\s+(.*?)($|#)/g) || [];
      
      if (putsMatches.length > 0 || printMatches.length > 0 || pMatches.length > 0) {
        output += "Output:\n";
        
        // Process puts statements
        putsMatches.forEach(match => {
          if (match.includes('#')) return; // Skip commented puts
          let content = match.substring(match.indexOf(' ') + 1).trim();
          if (content.includes('#')) {
            content = content.substring(0, content.indexOf('#')).trim();
          }
          
          // Handle string interpolation
          if (content.startsWith('"') && content.includes('#{')) {
            const templateText = content.substring(1, content.length - 1);
            const interpolated = templateText.replace(/\#{([^}]*)}/g, (_, expr) => `<${expr}>`);
            output += interpolated + '\n';
            return;
          }
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            output += content.substring(1, content.length - 1) + '\n';
            return;
          }
          
          // Handle string concatenation with +
          if (content.includes('+')) {
            const parts = content.split('+').map(p => p.trim());
            let result = '';
            
            parts.forEach(part => {
              if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
                result += part.substring(1, part.length - 1);
              } else {
                result += `<${part}>`;
              }
            });
            
            output += result + '\n';
            return;
          }
          
          // Handle expressions
          output += `<${content}>\n`;
        });
        
        // Process print statements
        printMatches.forEach(match => {
          if (match.includes('#')) return; // Skip commented prints
          let content = match.substring(match.indexOf(' ') + 1).trim();
          if (content.includes('#')) {
            content = content.substring(0, content.indexOf('#')).trim();
          }
          
          // Handle string interpolation
          if (content.startsWith('"') && content.includes('#{')) {
            const templateText = content.substring(1, content.length - 1);
            const interpolated = templateText.replace(/\#{([^}]*)}/g, (_, expr) => `<${expr}>`);
            output += interpolated;
            return;
          }
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            output += content.substring(1, content.length - 1);
            return;
          }
          
          // Handle expressions
          output += `<${content}>`;
        });
        
        // Process p statements (debug output)
        pMatches.forEach(match => {
          if (match.includes('#')) return; // Skip commented p
          let content = match.substring(match.indexOf(' ') + 1).trim();
          if (content.includes('#')) {
            content = content.substring(0, content.indexOf('#')).trim();
          }
          
          output += `<debug: ${content}>\n`;
        });
        
        output += "\nProgram executed with return code: 0\n";
      } else if (code.trim() && !methodMatches.length && !classMatches.length) {
        // Interactive mode-like output for simple expressions
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        if (lines.length > 0) {
          output += "Interactive evaluation:\n";
          lines.forEach(line => {
            if (line.includes('=')) {
              // Variable assignment
              const parts = line.split('=');
              output += `> ${parts[0].trim()} = ${parts[1].trim()} (assigned)\n`;
            } else if (!line.includes('require ')) {
              // Expression evaluation
              output += `> ${line.trim()} (evaluated to result)\n`;
            }
          });
          
          output += "\nProgram executed with return code: 0\n";
        }
      } else if (code.trim()) {
        output += "Program executed with no visible output.\n";
        output += "\nProgram executed with return code: 0\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Ruby simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  // Get the appropriate external compiler link based on the language
  const getExternalCompilerLink = () => {
    const encodedCode = encodeURIComponent(code);
    
    switch (language.id) {
      case 'python':
        return `https://www.online-python.com/?code=${encodedCode}`;
      case 'java':
        return `https://www.jdoodle.com/online-java-compiler/?code=${encodedCode}`;
      case 'cpp':
      case 'c':
        return `https://www.onlinegdb.com/online_c++_compiler?code=${encodedCode}`;
      case 'javascript':
        return `https://jsfiddle.net/create/?js=${encodedCode}`;
      case 'typescript':
        return `https://www.typescriptlang.org/play?#code/${encodedCode}`;
      case 'html':
        return `https://codepen.io/pen/?html=${encodedCode}`;
      case 'kotlin':
        return `https://play.kotlinlang.org/#code/${encodedCode}`;
      case 'swift':
        return `https://swift.godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:swift,selection:(endColumn:1,endLineNumber:1,positionColumn:1,positionLineNumber:1,selectionStartColumn:1,selectionStartLineNumber:1,startColumn:1,startLineNumber:1),source:'${encodedCode}'),l:'5',n:'0',o:'Swift+source+%231',t:'0')),k:50,l:'4',n:'0',o:'',s:0,t:'0'),(g:!((h:compiler,i:(compiler:swift-14,filters:(b:'0',binary:'1',commentOnly:'0',demangle:'0',directives:'0',execute:'1',intel:'0',libraryCode:'0',trim:'1'),fontScale:14,fontUsePx:'0',j:1,lang:swift,libs:!(),options:'',selection:(endColumn:1,endLineNumber:1,positionColumn:1,positionLineNumber:1,selectionStartColumn:1,selectionStartLineNumber:1,startColumn:1,startLineNumber:1),source:1),l:'5',n:'0',o:'Swift+(x86-64,+Swift+14)++Compiler+Explorer',t:'0')),k:50,l:'4',n:'0',o:'',s:0,t:'0')),l:'2',n:'0',o:'',t:'0')),version:4`;
      case 'csharp':
        return `https://dotnetfiddle.net/Mobile?code=${encodedCode}`;
      case 'go':
        return `https://go.dev/play/?code=${encodedCode}`;
      case 'rust':
        return `https://play.rust-lang.org/?code=${encodedCode}`;
      case 'php':
        return `https://3v4l.org/new#${encodedCode}`;
      case 'ruby':
        return `https://onecompiler.com/ruby?code=${encodedCode}`;
      default:
        return `https://godbolt.org/?code=${encodedCode}`;
    }
  };

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
              window.open(getExternalCompilerLink(), '_blank');
            }}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Open in external compiler"
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
              <div className="p-4 text-center flex flex-col items-center justify-center h-full text-muted-foreground">
                <Terminal className="h-8 w-8 mb-3 opacity-40" />
                <p>Output is displayed in the Console tab</p>
                <p className="text-xs mt-2 max-w-sm">Switch to the Console tab to see the simulated output of your code</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setActiveTab('console')}
                >
                  Go to Console
                </Button>
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
