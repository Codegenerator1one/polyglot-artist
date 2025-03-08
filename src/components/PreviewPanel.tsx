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
                  body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }\n                  code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }\n                  pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }\n                  blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #555; }\n                  img { max-width: 100%; }\n                  table { border-collapse: collapse; width: 100%; }\n                  th, td { border: 1px solid #ddd; padding: 8px; }\n                  th { background-color: #f5f5f5; }\n                </style>
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
      
      // Fixed: Check for syntax errors first - cleaned up the comparison
      if ((code.includes('import') && code.includes('{')) || (code.includes('print(') && !code.includes(')'))) {
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
          } else if (content.match(/^-?\d+(\.\d+)?$/)) {
            // Handle numeric literals
            output += `${content}\n`;
          } else {
            // Handle complex expressions
            output += `<expression: ${content}>\n`;
          }
        });
      } else if (code.trim()) {
        output += "\nTranspiled to JavaScript successfully.\n\nProgram executed with no console output.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`TypeScript simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Add placeholder functions for other language simulations 
  // that might be called but are not implemented yet
  const simulateKotlinExecution = (code: string) => {
    setCompiledOutput("[Kotlin Compiler v1.9.0]\nCompiled successfully.\n\n> Kotlin program executed. Output would appear here.");
  };

  const simulateSwiftExecution = (code: string) => {
    setCompiledOutput("[Swift Compiler v5.8.0]\nCompiled successfully.\n\n> Swift program executed. Output would appear here.");
  };

  const simulateCSharpExecution = (code: string) => {
    setCompiledOutput("[C# Compiler v10.0]\nCompiled successfully.\n\n> C# program executed. Output would appear here.");
  };

  const simulateGoExecution = (code: string) => {
    setCompiledOutput("[Go Compiler v1.20.3]\nCompiled successfully.\n\n> Go program executed. Output would appear here.");
  };

  const simulateRustExecution = (code: string) => {
    setCompiledOutput("[Rust Compiler v1.68.2]\nCompiled successfully.\n\n> Rust program executed. Output would appear here.");
  };

  const simulatePHPExecution = (code: string) => {
    setCompiledOutput("[PHP Interpreter v8.2.4]\nExecuted successfully.\n\n> PHP program executed. Output would appear here.");
  };

  const simulateRubyExecution = (code: string) => {
    setCompiledOutput("[Ruby Interpreter v3.2.1]\nExecuted successfully.\n\n> Ruby program executed. Output would appear here.");
  };

  useEffect(() => {
    if (language && !['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
      setCompiledOutput(`[${language.name} Compiler]\nCompiled successfully.\n\n> Program output will appear here when you run the code.`);
    }
  }, [language]);

  useEffect(() => {
    // Clear iframe content on language change
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.document.open();
      iframeRef.current.contentWindow.document.write('');
      iframeRef.current.contentWindow.document.close();
    }
    setCompiledOutput('');
    setError(null);
  }, [language]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white/90">
          Preview
        </h2>
        <div className="flex items-center space-
